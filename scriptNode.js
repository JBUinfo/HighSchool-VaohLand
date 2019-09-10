//express
const express = require('express');
const app = express();

//sockets
const http = require("http");
const server = http.Server(app);
const io = require('socket.io')(server);

//upload imgs
const readChunk = require('read-chunk');
const fileType = require('file-type');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'password', maxCount: 1 },{ name: 'Fecha', maxCount: 1 },{ name: 'image', maxCount: 1 }]);

//encrypt pass
const bcrypt = require('bcrypt');
const saltRounds = 10;

//bd
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
// mongoose.set('debug', true);
mongoose.connect("mongodb://xxx:xxx@localhost:27017/redSocial?authSource=admin&gssapiServiceName=mongodb",{"useNewUrlParser": true,"autoIndex":true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Follows = mongoose.model('Follows',new Schema ({
  nick_cliente1: String,
  nick_cliente2: String,
  date: { type: Date, default: Date.now }
},{versionKey: false}));
const Clientes = mongoose.model('Clientes',new Schema ({
  nick: {type: String, lowercase: true, unique: true},
  password: String,
  date: { type: Date, default: Date.now },
  fecha_cumple: Date,
  img_perfil: {type: String, unique: true},
  biografia: String,
  estado: Boolean
},{versionKey: false}));
const Posts = mongoose.model('Posts',new Schema ({
  nick_cliente: String,
  img_perfil: String,
  texto: String,
  likes: Number,
  dislikes: Number,
  fecha_creacion: {type: Date, default: Date.now},
  id_post_comentado: String,
  nick_cliente2: String,
  texto2: String
},{versionKey: false}));
const Likes = mongoose.model('Likes',new Schema ({
  nick_cliente: String,
  id_post: String
},{versionKey: false}));
const Dislikes = mongoose.model('Dislikes',new Schema ({
  nick_cliente: String,
  id_post: String
},{versionKey: false}));
const Chat_Directo = mongoose.model('Chat_Directo',new Schema ({
  nick_cliente1: String,
  nick_cliente2: String,
  texto: String,
  fecha_creacion: {type: Date, default: Date.now}
},{versionKey: false}));
const Chat_Global = mongoose.model('Chat_Global',new Schema ({
  nick_cliente: String,
  texto: String,
  fecha_creacion: {type: Date, default: Date.now}
},{versionKey: false}));
const Admin_Users = mongoose.model('Admin_Users',new Schema ({
  nick: {type: String, lowercase: true, unique: true},
  password: String
},{versionKey: false}));

//access
app.use(express.static('css'));
app.use(express.static('js'));
app.use(express.static(__dirname));

//route
app.get('/', function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get('/login', function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get('/login?*', function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get('/register', function(req, res) {
  res.sendFile(__dirname + "/register.html");
});

app.get('/nick/*', function (req, res) {
  res.sendFile(__dirname + "/nick.html");
});

app.get('/MD', function(req, res) {
  res.sendFile(__dirname + "/MD.html");
});

app.get('/chatGlobal', function(req, res) {
  res.sendFile(__dirname + "/chatGlobal.html");
});

app.get('/search', function(req, res) {
  res.sendFile(__dirname + "/search.html");
});

app.get('/loginAdmin', function(req, res) {
  res.sendFile(__dirname + "/loginAdmin.html");
});

app.get('/indexAdmin', function(req, res) {
  res.sendFile(__dirname + "/indexAdmin.html");
});

app.get('/chatGlobalAdmin', function(req, res) {
  res.sendFile(__dirname + "/chatGlobalAdmin.html");
});

app.get('/seePerfil/*', function (req, res) {
  res.sendFile(__dirname + "/seePerfil.html");
});

app.get('/register', function(req, res) {
  res.sendFile(__dirname + "/register.html");
});

app.get('/register/?*', function(req, res) {
  res.sendFile(__dirname + "/register.html");
});

//to register and upload img
app.post('/register', cpUpload, function(req, res) {
  if (req.body['nick'].trim().length > 20 || req.body['nick'].trim().length < 3) {
    res.redirect("/register?errorNickLength");
  } else if(req.body['password'].trim().length < 8){
    res.redirect("/register?errorPassword");
  } else{
    let buffer = readChunk.sync(req.files['image'][0]['path'], 0, fileType.minimumBytes);
    if (fileType(buffer)['mime'].indexOf("image") == 0) {
      Clientes.findOne({ nick: req.body['nick']},function (err, client) {
        if (err) return err;
        if (client == null && req.body['nick'] != 'admin') {
          bcrypt.hash(req.body['password'], saltRounds, function(err, hash) {
            Clientes.create({ nick: req.body['nick'], password: hash, img_perfil: req.files['image'][0]['filename'], fecha_cumple:new Date(req.body['Fecha']), estado: 1}, function (err, small) {
              if (err) return err;
              res.redirect('/login');
            });
          });
        } else {
          console.log('a');
          res.redirect("/register?errorNick");
        }
      });
    } else {
      res.redirect("/register?errorImage");
    }
  }
});



//array to save the socket and easily find the nick and more
let users = [];

//Usado en los perfiles
const month = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];


io.on('connection', function(socket) {
  socket.on('disconnect', function () {
    if (users[socket.id] != undefined){
      delete users[users[socket.id]['nick']];
      delete users[socket.id];
    }
  });

  socket.on('loginAdmin', function(login) {
    Admin_Users.findOne({ nick: login.nick, password: login.password},function (err, client) {
      if (err) return err;
      try{
        client == null ? socket.emit('loginVerify', null) : socket.emit('loginVerify', client._id);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('login', function(login) {
    Clientes.findOne({ nick: login.nick},function (err, client) {
      if (err) return err;
      try{
        if (client != null) {
          if (client.estado == true) {
            bcrypt.compare(login.password, client.password, function(err, res) {
              if (res) {
                socket.emit('loginVerify', {_id: client._id, nick:client.nick});
              } else {
                socket.emit('loginVerify', null);
              }
            });
          } else {
            socket.emit('baja');
          }
        } else {
          socket.emit('loginVerify', null);
        }
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('verifyCookieAdmin', function(valor) {
    Admin_Users.findOne({ _id: valor},function (err, client) {
      if (err) return err;
      try{
        if (client == null){
          // res.redirect('/loginAdmin');
        } else {
          users[socket.id] = [];
          users[socket.id]['_id'] = client._id;
          users[socket.id]['socket'] = socket;
          users[socket.id]['socket'].emit('verificado');
        }
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('verifyCookie', function(valor) {
    Clientes.findOne({ _id: valor},function (err, client) {
      if (err) return err;
      try{
        if (client == null){
          // res.redirect('/login');
        } else {
          users[client.nick] = socket.id;
          users[socket.id] = [];
          users[socket.id]['_id'] = client._id;
          users[socket.id]['nick'] = client.nick;
          users[socket.id]['img_perfil'] = client.img_perfil;
          users[socket.id]['socket'] = socket;
          users[socket.id]['socket'].emit('verificado');
        }
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('getTL', function(data = 0) {
    try{
      Follows.find({nick_cliente1: users[socket.id]['nick']}).select('-_id nick_cliente2').exec(function (err, follows) {
        try{
          for (let i = 0; i < follows.length; i++) {
            follows[i] = follows[i]['nick_cliente2'];
          }
          follows[follows.length] = users[socket.id]['nick'];
        } catch (e){
          console.log('no ha pasado nada');
          console.log(e);
        }
        Posts.find().where('nick_cliente').in(follows).sort('-_id').limit(50+data).exec(function (err, posts) {
          if (err) return handleError(err);
          try{
            if (data == 0) {
              users[socket.id]['socket'].emit('refreshTL', posts);
            } else {
              //Esto se hace para que el lado cliente sepa que el usuario le ha dado al boton "cargar mas"
              //y los posts recibidos los anyada al final de la TL
              //al asi como una flag
              users[socket.id]['socket'].emit('refreshTL', {posts:posts, loadMore:'true'});
            }
          } catch (e){
            console.log('no ha pasado nada');
            console.log(e);
          }
        });
      })
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('savePost', function(valorPost) {
    try{
      Posts.create({ nick_cliente: users[socket.id]['nick'], texto: valorPost, likes: 0, dislikes:0, img_perfil: users[socket.id]['img_perfil']}, function (err, small) {
        try{
          users[socket.id]['socket'].emit('sendUniquePost', small);
        } catch (e){
          console.log('no ha pasado nada');
          console.log(e);
        }
      });
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deletePostAdmin', function(valorPost) {
    try{
      Admin_Users.findOne({ _id: users[socket.id]['_id']},function (err, client) {
        if (err) return err;
        if (client != null) {
          Likes.deleteOne({ id_post:valorPost}, function (err) {});
          Dislikes.deleteOne({ id_post:valorPost}, function (err) {});
          Posts.deleteOne({ _id:valorPost}, function (err) {});
        }
      });
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deletePost', function(valorPost) {
    try{
      Likes.deleteOne({ nick_cliente: users[socket.id]['nick'], id_post:valorPost}, function (err) {});
      Dislikes.deleteOne({ nick_cliente: users[socket.id]['nick'], id_post:valorPost}, function (err) {});
      Posts.deleteOne({ nick_cliente: users[socket.id]['nick'], _id:valorPost}, function (err) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('getFavs', function() {
    Likes.find({ nick_cliente: users[socket.id]['nick']}).select('id_post').exec(function (err, msgs) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('sendMGs', msgs);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }

    });
  });

  socket.on('getDislikes', function() {
    Dislikes.find({ nick_cliente: users[socket.id]['nick']}).select('id_post').exec(function (err, msgs) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('sendDislikes', msgs);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('addMG', function(valorPost) {
    try{
      Likes.create({ nick_cliente: users[socket.id]['nick'], id_post:valorPost}, function (err) {});
      Posts.findOneAndUpdate({_id:valorPost}, { $inc: { likes: 1 } }, {new: true },function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deleteMG', function(valorPost) {
    try{
      Likes.deleteOne({ nick_cliente: users[socket.id]['nick'], id_post:valorPost}, function (err) {});
      Posts.findOneAndUpdate({_id:valorPost }, { $inc: { likes: -1 } }, {new: true },function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('addDislike', function(valorPost) {
    try{
      Dislikes.create({ nick_cliente: users[socket.id]['nick'], id_post:valorPost}, function (err) {});
      Posts.findOneAndUpdate({_id:valorPost }, { $inc: { dislikes: 1 } }, {new: true },function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deleteDislike', function(valorPost) {
    try{
      Dislikes.deleteOne({ nick_cliente: users[socket.id]['nick'], id_post:valorPost}, function (err) {});
      Posts.findOneAndUpdate({_id:valorPost }, { $inc: { dislikes: -1 } }, {new: true },function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('getCG', function() {
    returnCG(socket);
  });

  socket.on('sendMsg', function(valorMsg) {
    try{
      Chat_Global.create({ nick_cliente: users[socket.id]['nick'], texto: valorMsg}, function (err) {
        if (err) return err;
        returnCG();
      });
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deleteMSG', function(valorPost) {
    try{
      Chat_Global.deleteOne({ nick_cliente: users[socket.id]['nick'], _id:valorPost}, function (err) {});
      returnCG();
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('getTLNick', function(data) {
    if (data.contador == undefined) {
      data.contador = 0;
    }
    Posts.find({nick_cliente: data.nick}).sort('-_id').limit(50+data.contador).exec(function (err, msgs) {
      if (err) return handleError(err);
      try{
        if (data.contador == 0) {
          users[socket.id]['socket'].emit('sendTLNick', msgs);
        } else {
          //Esto se hace para que el lado cliente sepa que el usuario le ha dado al boton "cargar mas"
          //y los posts recibidos los anyada al final de la TL
          //al asi como una flag
          users[socket.id]['socket'].emit('sendTLNick', {msgs:msgs, loadMore:'true'});
        }
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('getFollowers', function(nick) {
    Follows.count({nick_cliente2: nick}).exec(function (err, count) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('sendFollowers', count);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('getFollows', function(nick) {
    Follows.count({nick_cliente1: nick}).exec(function (err, count) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('sendFollows', count);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('getPerfil', function(nick) {
    Clientes.findOne({nick: nick}).exec(function (err, cliente) {
      if (err) return handleError(err);
      try{
        if (cliente != null) {
          let fecha = new Date(cliente.fecha_cumple);
          fecha = ''+fecha.getUTCDate()+'/'+month[fecha.getUTCMonth()];
          cliente = {biografia:cliente.biografia,fecha_cumple:fecha,img_perfil:cliente.img_perfil};
          users[socket.id]['socket'].emit('sendPerfil', cliente);
        }
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('editBiografia', function(bio) {
    try{
      Clientes.findOneAndUpdate({_id:users[socket.id]['_id'] }, { "biografia" : bio }, function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('follow', function(nick) {
    try{
      Follows.create({nick_cliente1:users[socket.id]['nick'], nick_cliente2:nick}, function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('unfollow', function(nick) {
    try{
      Follows.deleteOne({nick_cliente1:users[socket.id]['nick'], nick_cliente2:nick}, function(err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('getFollow', function(nick) {
    Follows.find({nick_cliente1: users[socket.id]['nick'], nick_cliente2: nick}).select('-_id nick_cliente2').exec(function (err, follow) {
      try{
        follow.length == 0 ? users[socket.id]['socket'].emit('sendFollow', false) : users[socket.id]['socket'].emit('sendFollow', true);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    })
  });

  socket.on('getMDs', function() {
    try{
      Chat_Directo.distinct('nick_cliente1', { '$or': [ { nick_cliente1: users[socket.id]['nick'] }, {nick_cliente2: users[socket.id]['nick'] } ] }).exec(function (err, nicksMDs) {
        Clientes.find().where('nick').in(nicksMDs).select('-_id nick img_perfil').exec(function (err, perfiles) {
          if (err) return handleError(err);
          users[socket.id]['socket'].emit('sendMDs', perfiles);
        });
      })
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

//para recibir un chat especifico
  socket.on('getOneMD', function(nick) {
    try{
      Chat_Directo.find({ '$or': [ { nick_cliente1: users[socket.id]['nick'] , nick_cliente2: nick }, {nick_cliente2: users[socket.id]['nick'] , nick_cliente1: nick } ] }).exec(function (err, chatMD) {
        try{
          users[socket.id]['socket'].emit('sendOneMD', chatMD);
        } catch (e){
          console.log('no ha pasado nada');
          console.log(e);
        }
      })
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('addMD', function(data) {
    try{
      Chat_Directo.create({nick_cliente1:users[socket.id]['nick'], nick_cliente2:data.nick, texto: data.texto}, function (err, response) {
        users[socket.id]['socket'].emit('getOwnSendedMD', {nick:users[socket.id]['nick'], texto:data.texto, _id: response._id});
      });
      if (data.crear == true) {
        Chat_Directo.create({nick_cliente1:data.nick, nick_cliente2:users[socket.id]['nick'], texto: ''}, function (err, response) {
          users[socket.id]['socket'].emit('getOtherMD', {nick:users[socket.id]['nick'], texto:data.texto, _id: response._id});
        });
      }
      if (users[data.nick] != undefined ) users[users[data.nick]]['socket'].emit('getOtherMD', {nick:users[socket.id]['nick'], texto:data.texto});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deleteMD', function(data) {
    try{
      Chat_Directo.deleteOne({nick_cliente1:users[socket.id]['nick'], _id: data}, function (err, response) {});
    } catch (e){
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('addComent', function(data) {
    Posts.findOne({ '_id': data._id }).exec(function (err, post) {
      if (err) return handleError(err);
      try{
        Posts.create({nick_cliente:users[socket.id]['nick'], img_perfil:users[socket.id]['img_perfil'], texto: data.texto, likes: 0, dislikes:0, id_post_comentado: data._id, nick_cliente2:post.nick_cliente, texto2:post.texto}, function (err, response) {
          users[socket.id]['socket'].emit('sendUniqueComment', response);
        });
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('searchByNickAdmin', function(data) {
    Clientes.find({ "nick" : { $regex: data, $options: 'i' }}).limit(50).exec(function (err, clientes) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('returnSearchNick', clientes);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('searchByNick', function(data) {
    Posts.find({ "nick_cliente" : { $regex: data, $options: 'i' }}).limit(50).exec(function (err, posts) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('returnSearch', posts);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('searchByText', function(data) {
    Posts.find({ "texto" : { $regex: data, $options: 'i' }}).sort('-_id').limit(50).exec(function (err, posts) {
      if (err) return handleError(err);
      try{
        users[socket.id]['socket'].emit('returnSearch', posts);
      } catch (e){
        console.log('no ha pasado nada');
        console.log(e);
      }
    });
  });

  socket.on('unsuscribeAccount', function(data) {
    try{
      Admin_Users.findOne({ _id: users[socket.id]['_id']},function (err, client) {
        if (err) return err;
        if (client != null) {
          Clientes.findOneAndUpdate({nick:data}, { 'estado': 0 }, function(err, response) {});
        }
      });
    } catch (e) {
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('suscribeAccount', function(data) {
    try{
      Admin_Users.findOne({ _id: users[socket.id]['_id']},function (err, client) {
        if (err) return err;
        if (client != null) {
          Clientes.findOneAndUpdate({nick:data}, { 'estado': 1 }, function(err, response) {});
        }
      });
    } catch (e) {
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('deleteMSGAdmin', function(valorPost) {
    try{
      Admin_Users.findOne({ _id: users[socket.id]['_id']},function (err, client) {
        if (err) return err;
        if (client != null) {
          try{
            Chat_Global.deleteOne({ _id:valorPost}, function (err) {});
            returnCG();
          } catch (e){
            console.log('no ha pasado nada');
            console.log(e);
          }
        }
      });
    } catch (e) {
      console.log('no ha pasado nada');
      console.log(e);
    }
  });

  socket.on('sendMsgAdmin', function(valorMsg) {
    try{
      Admin_Users.findOne({ _id: users[socket.id]['_id']},function (err, client) {
        if (err) return err;
        if (client != null) {
          Chat_Global.create({ nick_cliente: 'admin', texto: valorMsg}, function (err) {
            if (err) return err;
            returnCG();
          });
        }
      });
    } catch (e) {
      console.log('no ha pasado nada');
      console.log(e);
    }

  });
});

//chat global
function returnCG(socket = null){
  Chat_Global.find().sort({_id:-1}).limit(100).exec(function (err, msgs) {
    if (err) return handleError(err);
    try{
      socket == null ? io.sockets.emit('refreshCG', msgs) : users[socket.id]['socket'].emit('refreshCG', msgs);
    } catch (e) {
      console.log('no ha pasado nada');
      console.log(e);
    }
  });
}


app.listen(80);
server.listen(3000);
