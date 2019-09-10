let follows;
let followers = 0;
let followsCount = 0;

function loadMore(){
  contador+=50;
  let nick = document.location.pathname.split('/')[2];
  socket.emit('getTLNick', {nick:nick, contador: contador});
}

function unfollow(nick){
  socket.emit('unfollow', nick);
  let follow = document.getElementById('unfollow');
  follow.textContent = 'Follow';
  follow.setAttribute('onclick', `follow('${nick}')`);
  follow.setAttribute('id', 'follow');
}

function follow(nick){
  socket.emit('follow', nick);
  let follow = document.getElementById('follow');
  follow.textContent = 'Unfollow';
  follow.setAttribute('onclick', `unfollow('${nick}')`);
  follow.setAttribute('id', 'unfollow');
}

//change the bio
function editBiografia(){
  document.getElementById('editBiografia').style.display = 'block';
  document.getElementById('textEditBiografia').style.display = 'none';
  document.getElementById('sendEditPerfil').style.display = 'none';
  let editBiografia = document.getElementById('textEditBiografia').value.trim();
  socket.emit('editBiografia', editBiografia);
  editBiografia.textContent = '';
  document.getElementById('biografiaI').textContent = 'Biografia: '+ editBiografia;
}

//show the box to write the bio
function insertInputBio(){
  document.getElementById('editBiografia').style.display = 'none';
  document.getElementById('textEditBiografia').style.display = 'block';
  document.getElementById('sendEditPerfil').style.display = 'block';
}


document.addEventListener('DOMContentLoaded', async () => {
  let nick = document.location.pathname.split('/')[2];
  document.getElementById('logout').addEventListener('click', ()=>{
    document.cookie = 'nick=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/login');
  })

  socket.on('verificado', function(){
    socket.emit('getFavs');
    socket.emit('getFollow', nick);
    socket.emit('getDislikes');
    socket.emit('getTLNick', {nick:nick});
    socket.emit('getFollowers', nick);
    socket.emit('getFollows', nick);
    socket.emit('getPerfil', nick);
  });

  socket.on('sendMGs', function(mg){
    for (let i = 0; i < mg.length; i++) {
      favs[mg[i]['id_post']] = null;
    }
  });
  socket.on('sendDislikes', function(dis){
    for (let i = 0; i < dis.length; i++) {
      dislikes[dis[i]['id_post']] = null;
    }
  });
  socket.on('sendFollow', function(fl){
    follows = fl;
  });
  socket.on('sendFollowers', function(followes){
    followers = followes;
  });
  socket.on('sendFollows', function(followes){
    followsCount = followes;
  });
  socket.on('sendTLNick', function(data){
    if (data.loadMore == 'true') {
      showPosts(data.msgs, 'loadMore');
    } else {
      showPosts(data);
    }
  });
  socket.on('sendPerfil', function(data){
    //muestra la caja con info del perfil
    //box
    let boxPerfil = document.getElementsByClassName('boxPerfil')[0];

    //img
    let boximg = document.createElement('div');
    boximg.setAttribute('class', 'boximg');
    let img = document.createElement('img');
    img.setAttribute('src', '/uploads\\'+data.img_perfil);
    boximg.appendChild(img);
    document.getElementById('imgPerfil').appendChild(boximg);

    //nick
    let nombreNick = document.createElement('div');
    nombreNick.setAttribute('class', 'nick');
    nombreNick.appendChild(document.createTextNode('@'+nick));
    boxPerfil.appendChild(nombreNick);

    //hr
    boxPerfil.appendChild(document.createElement('hr'));

    //follow
    let followsElement = document.createElement('div');
    followsElement.setAttribute('style', 'display:inline-block');
    followsElement.appendChild(document.createTextNode('Seguidores:'+followers));
    followsElement.appendChild(document.createElement('br'));
    followsElement.appendChild(document.createTextNode('Seguidos:'+followsCount));

    boxPerfil.appendChild(followsElement);

    //hr
    boxPerfil.appendChild(document.createElement('hr'));

    //biografy
    let biografia = document.getElementById('biografia');
    let i = document.createElement('i');
    i.setAttribute('id', 'biografiaI');
    i.appendChild(document.createTextNode('Biografia: '+ (data.biografia == undefined ? '' : data.biografia) ));
    biografia.appendChild(i);

    //show "edit the bio" if it is ur own perfil
    if (getCookie('nick') == nick) {
      let textarea = document.createElement('textarea');
      textarea.setAttribute('style', 'display:none');
      textarea.setAttribute('id', 'textEditBiografia');
      biografia.appendChild(textarea);
      biografia.appendChild(document.createElement('br'));

      let button = document.createElement('input');
      button.setAttribute('type', 'button');
      button.setAttribute('id', 'sendEditPerfil');
      button.setAttribute('style', 'color:black;display:none');
      button.setAttribute('value', 'Editar');
      button.setAttribute('onclick', 'editBiografia()');
      biografia.appendChild(button);

      let penEdit = document.createElement('img');
      penEdit.setAttribute('class', 'penEdit');
      penEdit.setAttribute('src', '/img/writePost.png');
      penEdit.setAttribute('id', 'editBiografia');
      penEdit.setAttribute('onclick', 'insertInputBio()');
      biografia.appendChild(penEdit);
    }
    boxPerfil.appendChild(biografia);

    //hr
    boxPerfil.appendChild(document.createElement('hr'));

    //nacimiento
    let nacimiento = document.getElementById('nacimiento');
    nacimiento.textContent = 'Cumpleaños: '+data.fecha_cumple;
    boxPerfil.appendChild(nacimiento);

    //hr
    boxPerfil.appendChild(document.createElement('hr'));

    //buttons follow/unfollow and MD
    if (nick != getCookie('nick')) {
      let botones = document.createElement('div');
      botones.setAttribute('id', 'botones');
      let boton = document.createElement('button');
      if (follows) {
        boton.textContent = 'Unfollow';
        boton.setAttribute('id', 'unfollow');
        boton.setAttribute('onclick', `unfollow('${nick}')`);
      } else {
        boton.textContent = 'Follow';
        boton.setAttribute('id', 'follow');
        boton.setAttribute('onclick', `follow('${nick}')`);
      }
      boton.setAttribute('type', 'button');
      boton.setAttribute('class', 'btnsPerfil');
      botones.appendChild(boton);
      boton = document.createElement('button');
      boton.textContent = 'Send MD';
      boton.setAttribute('type', 'button');
      boton.setAttribute('class', 'btnsPerfil');
      boton.setAttribute('onclick', `showChat('${nick}')`);
      botones.appendChild(boton);
      boxPerfil.appendChild(botones);
    }

  });
})
