let creador = getCookie('session');
let contador = 0;
const socket = io('http://localhost:3000');

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

//posts == array of new posts
function showPosts(posts, orden = null) {
  let nick = document.location.pathname.split('/')[2];
  //convert to array the undefined
  if (posts.length == undefined) posts = [posts];
  let content = document.getElementsByClassName('content')[0];
  let post = '';
  let contentPost = '';
  let imgPost = '';
  let img = '';
  let a = '';
  let textPost = '';
  let nickPost = '';
  let textBoxPost = '';
  let iconsPost = '';
  let i = 0;
  if (orden != null) {i = contador};
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
    a.setAttribute("href", "/seePerfil/"+posts[i].nick_cliente);
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
    //Papelera
    img = document.createElement("img");
    img.setAttribute("src", "/img/trash.png");
    img.setAttribute("onclick", `deletePost('${posts[i]._id}')`);
    iconsPost.appendChild(img);

    p = document.createElement("div");
    p .setAttribute("style", "display: inline-block; margin-left:20px; font-size:12px");
    p.appendChild(document.createTextNode(new Date( posts[i].fecha_creacion).toLocaleString()));
    iconsPost.appendChild(p);

    post.appendChild(contentPost);
    post.appendChild(iconsPost);
    content.appendChild(post);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
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

  document.getElementById('logout').addEventListener('click', ()=>{
    document.cookie = 'permisos=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/login');
  })
  let nick = document.location.pathname.split('/')[2];

  //verification
  if (getCookie('session')) {
    socket.emit('verifyCookieAdmin', creador);
  } else {
    window.location.replace('/loginAdmin');
  }
})
