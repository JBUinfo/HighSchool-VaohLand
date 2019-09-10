let creador = getCookie('session');
const socket = io('http://localhost:3000');
let favs = [];
let dislikes = [];
let contador = 0;
let crear = true;

//elementsDOM
let backgroundBlack;
let seePostear;
let seeChat;
let answerPost;
let textAnswer;
let sendAnswer;
let textPostear;
let sendMDElement;
let chat;
let textMD;


//cname == nombre de cookie
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Coloca posts
// posts == array de posts que van a ser colocados
// cargarMas == sirve para cuando pulsas en el boton "cargar mas", solo coloque los posts nuevos
// ponerArriba == En caso de haber creado un nuevo post, se colocará como firstChild
function showPosts(posts, cargarMas = null, ponerArriba = true) {
  textPostear.value = '';
  let nick = document.location.pathname.split('/')[2];
  if (document.location.pathname == '/MD') return;
  if (posts.length == undefined) posts = [posts];
  let content = document.getElementsByClassName('content')[0];
  let post = '';
  let contentPost = '';
  let imgPost = '';
  let img = '';
  let a = '';
  let strImg = '';
  let textPost = '';
  let nickPost = '';
  let textBoxPost = '';
  let iconsPost = '';
  let p = '';
  let i = 0;
  if (cargarMas != null) {i = contador};
  for (; i < posts.length; i++) {
    post = document.createElement("div");
    post.setAttribute("class", "post");
    post.setAttribute("id", posts[i]._id);
    contentPost = document.createElement("div");
    contentPost.setAttribute("class", "contentPost");
    //Img perfil
    imgPost = document.createElement("div");
    imgPost.setAttribute("class", "imgPost");
    a = document.createElement("a");
    a.setAttribute("href", "/nick/"+posts[i].nick_cliente);
    img = document.createElement("img");
    img.setAttribute("src", '/uploads\\'+posts[i].img_perfil);
    a.appendChild(img);
    imgPost.appendChild(a);
    contentPost.appendChild(imgPost);
    //nick & text
    textPost = document.createElement("div");
    textPost.setAttribute("class", "textPost");
    //nick
    nickPost = document.createElement("div");
    nickPost.setAttribute("class", "nickPost");
    nickPost.appendChild(document.createTextNode('@'+posts[i].nick_cliente));
    a = '';
    a = document.createElement("a");
    a.setAttribute("href", "/nick/"+posts[i].nick_cliente);
    a.appendChild(nickPost);
    textPost.appendChild(a);
    //caja superior de un comentario
    if (posts[i].id_post_comentado) {
      textBoxPost = document.createElement("div");
      textBoxPost.setAttribute("class", 'postCommented');
      textBoxPost.appendChild(document.createTextNode('@'+posts[i].nick_cliente2));
      textBoxPost.appendChild(document.createElement("br"));
      textBoxPost.appendChild(document.createTextNode(posts[i].texto2));
      textPost.appendChild(textBoxPost);
    }
    //text
    textBoxPost = document.createElement("div");
    textBoxPost.setAttribute("id", posts[i]._id + 'texto');
    textBoxPost.appendChild(document.createTextNode(posts[i].texto));
    textPost.appendChild(textBoxPost);
    contentPost.appendChild(textPost);
    //caja de iconos
    iconsPost = document.createElement("div");
    iconsPost.setAttribute("class", "iconsPost");
    //Img Likes
    img = document.createElement("img");
    if (favs[posts[i]._id] === null) {
      img.setAttribute("src", "/img/starSelected.png");
      img.setAttribute("onclick", `deleteMG('${posts[i]._id}', this)`);
    } else {
      img.setAttribute("src", "/img/star.png");
      img.setAttribute("onclick", `addMG('${posts[i]._id}', this)`);
    }
    iconsPost.appendChild(img);
    //Num Likes
    strImg = document.createElement("div");
    strImg.setAttribute("style", "display: inline-block");
    strImg.appendChild(document.createTextNode(posts[i].likes));
    iconsPost.appendChild(strImg);
    //Img Dislike
    img = document.createElement("img");
    if (dislikes[posts[i]._id] === null) {
      img.setAttribute("src", "/img/sadSelected.png");
      img.setAttribute("onclick", `deleteDislike('${posts[i]._id}', this)`);
    } else {
      img.setAttribute("src", "/img/sad.png");
      img.setAttribute("onclick", `addDislike('${posts[i]._id}', this)`);
    }
    iconsPost.appendChild(img);
    //Num Dislikes
    strImg = document.createElement("div");
    strImg.setAttribute("style", "display: inline-block");
    strImg.appendChild(document.createTextNode(posts[i].dislikes));
    iconsPost.appendChild(strImg);
    //Answer
    img = document.createElement("img");
    img.setAttribute("src", "/img/answer.png");
    img.setAttribute("onclick", `showBoxAnswer('${posts[i]._id}')`);
    iconsPost.appendChild(img);
    //MD
    img = document.createElement("img");
    img.setAttribute("src", "/img/MD.png");
    img.setAttribute("onclick", `showChat('${posts[i].nick_cliente}')`);
    iconsPost.appendChild(img);
    //Papelera
    if (posts[i].nick_cliente == getCookie('nick')) {
      img = document.createElement("img");
      img.setAttribute("src", "/img/trash.png");
      img.setAttribute("onclick", `deletePost('${posts[i]._id}')`);
      iconsPost.appendChild(img);
    }
    //Fecha
    p = document.createElement("div");
    p .setAttribute("style", "display: inline-block; margin-left:20px; font-size:12px");
    p.appendChild(document.createTextNode(new Date( posts[i].fecha_creacion).toLocaleString()));
    iconsPost.appendChild(p);

    post.appendChild(contentPost);
    post.appendChild(iconsPost);

    //si es un comentario o una nueva publicacion, se coloca arriba.
    //si es mostrar los posts que ya existen, se van colocando hacia abajo.
    ponerArriba ? content.appendChild(post) : content.insertBefore(post, content.firstChild);
  }
}

//MODAL
function showBoxAnswer(idPost) {
  backgroundBlack.style.display = 'inherit';
  seePostear.style.display = 'none';
  seeChat.style.display = 'none';
  answerPost.style.display = 'inherit';
  document.getElementById('seeLastPost').textContent = document.getElementById(idPost+'texto').textContent;
  textAnswer.focus();
  sendAnswer.setAttribute("onclick", `answer('${idPost}')`);
  sendAnswer.setAttribute("value", idPost);
}
//MODAL
function showBoxPostear(){
  backgroundBlack.style.display = 'inherit';
  seePostear.style.display = 'inherit';
  seeChat.style.display = 'none';
  answerPost.style.display = 'none';
  textPostear.focus();
}
//MODAL
function showChat(nick){
  backgroundBlack.style.display = 'inherit';
  document.getElementById('boxPostear').style.height = '70%';
  seePostear.style.display = 'none';
  seeChat.style.display = 'inherit';
  answerPost.style.display = 'none';
  sendMDElement.setAttribute("value", nick);
  sendMDElement.setAttribute("onclick", `sendMD('${nick}')`);
  chat.textContent = '';
  textMD.focus();
  socket.emit('getOneMD', nick);
}
//Action from modal
function sendMD(nick){
  let text = textMD.value.trim();
  if (text != '' && nick != '') {
    socket.emit('addMD',{nick:nick, texto: text, crear:crear});
  }
}
//Action from modal
function sendPost(){
  let text = textPostear.value.trim();
  if (text != '' && text != null) {
    socket.emit('savePost', text);
    backgroundBlack.style.display = 'none';
  }
}
//Action from modal
function answer(idPost) {
  backgroundBlack.style.display = 'none';
  let textAnswer = document.getElementById('textAnswer');
  if (textAnswer.value.trim() != '' && textAnswer.value.trim() != null) {
    socket.emit('addComent', {_id:idPost,texto:textAnswer.value.trim()});
    textAnswer.textContent = '';
  }
}

//chat of the MD
function putChat(data){
  if (data.length != 0 ) {
    crear = false;
  } else {
    crear = true;
  }
  let fila = '';
  let lugar = '';
  let trash = '';
  let chat =  document.getElementById('chat');
  for (let i = 0; i < data.length; i++) {
    if (data[i].texto != '') {
      fila = document.createElement("div");
      fila.setAttribute("class", "fila");
      fila.setAttribute("id", data[i]._id);
      lugar = document.createElement("div");
      if (data[i].nick_cliente1 == getCookie('nick')) {
        lugar.setAttribute("class", "derecha");
        trash = document.createElement("img");
        trash.setAttribute("src", "/css/img/trash.png");
        trash.setAttribute("style", "height:25px;");
        trash.setAttribute("onclick", `deleteMD('${data[i]._id}')`);
        lugar.appendChild(document.createTextNode(data[i].texto));
        lugar.appendChild(trash);
      } else {
        lugar.setAttribute("class", "izquierda");
        lugar.appendChild(document.createTextNode(data[i].texto));
      }
      fila.appendChild(lugar);
      chat.appendChild(fila);
    }
  }
}

//Functions of the posts
function deleteMD(idMD) {
  let post = document.getElementById(idMD);
  post.parentNode.removeChild(post);
  socket.emit('deleteMD', idMD);
}

//Functions of the posts
function deletePost(idPost) {
  let post = document.getElementById(idPost);
  post.parentNode.removeChild(post);
  socket.emit('deletePost', idPost);
}

function addMG(idPost, img) {
  let n = parseInt(img.nextElementSibling.innerHTML);
  img.nextElementSibling.textContent = ++n;
  img.setAttribute("src", '/img/starSelected.png');
  img.setAttribute("onclick", `deleteMG('${idPost}', this)`);
  socket.emit('addMG', idPost);
}

function deleteMG(idPost, img) {
  let n = parseInt(img.nextElementSibling.innerHTML);
  img.nextElementSibling.textContent = --n;
  img.setAttribute("src", '/img/star.png');
  img.setAttribute("onclick", `addMG('${idPost}', this)`);
  socket.emit('deleteMG', idPost);
}

function addDislike(idPost, img) {
  let n = parseInt(img.nextElementSibling.innerHTML);
  img.nextElementSibling.textContent = ++n;
  img.setAttribute("src", '/img/sadSelected.png');
  img.setAttribute("onclick", `deleteDislike('${idPost}', this)`);
  socket.emit('addDislike', idPost);
}

function deleteDislike(idPost, img) {
  let n = parseInt(img.nextElementSibling.innerHTML);
  img.nextElementSibling.textContent = --n;
  img.setAttribute("src", '/img/sad.png');
  img.setAttribute("onclick", `addDislike('${idPost}', this)`);
  socket.emit('deleteDislike', idPost);
}

document.addEventListener("DOMContentLoaded", async () => {
  let iconHamburguer = document.getElementById('iconHamburguer');
  let menuOpen = false;
  iconHamburguer.addEventListener("click", () => {
    if (menuOpen) {
      document.getElementById('navbarContent').className  = 'navbarContent';
      menuOpen = false;
    } else {
      document.getElementById('navbarContent').className  = 'menuMovilOpen';
      menuOpen = true;
    }
  })

  if (getCookie('session')) {
    socket.emit('verifyCookie', creador);
  } else {
    window.location.replace('/login');
  }
  let content = document.getElementsByClassName('content')[0];
  backgroundBlack = document.getElementById('backgroundBlack');
  seePostear = document.getElementById('seePostear');
  seeChat = document.getElementById('seeChat');
  answerPost = document.getElementById('answerPost');
  textAnswer = document.getElementById('textAnswer');
  sendAnswer = document.getElementById('sendAnswer');
  textPostear = document.getElementById('textPostear');
  sendMDElement = document.getElementById('sendMDElement');
  chat = document.getElementById('chat');
  textMD = document.getElementById('textMD');

  document.getElementById('urlNick').setAttribute("href", "/nick/"+getCookie('nick'));

  backgroundBlack.style.display = 'none';
  backgroundBlack.addEventListener("click", (event) => {
    if (event.path[0] == backgroundBlack) backgroundBlack.style.display = 'none';
  });

  document.addEventListener("keydown", (even) => {
    if (even.key == 'Enter' &&  backgroundBlack.style.display == 'inherit' && seePostear.style.display == 'inherit') {
      sendPost();
    } else if (even.key == 'Enter' &&  backgroundBlack.style.display == 'inherit' && seeChat.style.display == 'inherit'){
      sendMD(sendMDElement.value);
    } else if (even.key == 'Enter' &&  backgroundBlack.style.display == 'inherit' && answerPost.style.display == 'inherit'){
      answer(sendAnswer.value);
    }
  })

  socket.on('sendUniquePost', function(data){
    showPosts(data,null, false);
  });

  socket.on('sendUniqueComment', function(data){
    showPosts(data,null, false);
  });

  socket.on('sendOneMD', function(data){
    putChat(data);
  });

  socket.on('getOwnSendedMD', function(data){
    let fila = document.createElement("div");
    fila.setAttribute("class", "fila");
    fila.setAttribute("id", data._id);
    let lugar = document.createElement("div");
    lugar.setAttribute("class", "derecha");
    let trash = '';
    trash = document.createElement("img");
    trash.setAttribute("src", "/css/img/trash.png");
    trash.setAttribute("style", "height:25px;");
    trash.setAttribute("onclick", `deleteMD('${data._id}')`);
    lugar.appendChild(document.createTextNode(data.texto));
    lugar.appendChild(trash);
    fila.appendChild(lugar);
    chat.appendChild(fila);
    textMD.value = '';
  })

//cuando se reciba un mensaje de la otra persona
  socket.on('getOtherMD', function(data){
    if (sendMDElement.value == data.nick && data.nick != getCookie('nick')) {
      let fila = document.createElement("div");
      fila.setAttribute("class", "fila");
      let lugar = documentateElement("div");
      lugar.setAttribute("class", "izquierda");
      lugar.appendChild(document.createTextNode(data.texto));
      fila.appendChild(lugar);
      chat.appendChild(fila);
    }
  });
});
