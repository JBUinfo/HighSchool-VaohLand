function deletePost(idPost) {
  let post = document.getElementById(idPost);
  post.parentNode.removeChild(post);
  socket.emit('deletePostAdmin', idPost);
}

//show Cards when u search a perfil
function showCardsMDs(data){
  let card = '';
  let spcMD = '';
  let center = '';
  let a = '';
  let imgPerfil = '';
  let nickPerfil = '';
  let img = '';
  let button = '';
  let content = document.getElementById('content');
  for (let i = 0; i < data.length; i++) {
    //box
    bloqueMD = document.createElement("div");
    bloqueMD.setAttribute("class", "bloqueMD");

    //perfil
    a = document.createElement("a");
    a.setAttribute("href", "/seePerfil/"+data[i].nick);
    imgPerfil = document.createElement("div");
    imgPerfil.setAttribute("class", "imgPerfil");
    img = document.createElement("img");
    img.setAttribute("src", '/uploads\\'+data[i].img_perfil);
    imgPerfil.appendChild(img);

    //nick
    nickPerfil = document.createElement("div");
    nickPerfil.setAttribute("class", "nickPerfil");
    nickPerfil.appendChild(document.createTextNode('@'+data[i].nick));
    a.appendChild(imgPerfil);
    a.appendChild(nickPerfil);
    bloqueMD.appendChild(a);

    //hr
    bloqueMD.appendChild(document.createElement("hr"));

    //buton delete
    spcDelete = document.createElement("div");
    spcDelete.setAttribute("class", "spcDelete");
    button = document.createElement("button");
    button.setAttribute("type", "button");
    if (data[i].estado == true || data[i].estado == undefined ) {
      button.setAttribute("class", "buttonDelete");//buttonMD
      button.setAttribute("onclick", `unsuscribeAccount('${data[i].nick}', this)`);
      button.appendChild(document.createTextNode('Dar de baja'));
    } else {
      button.setAttribute("class", "buttonAdd");//buttonMD
      button.setAttribute("onclick", `suscribeAccount('${data[i].nick}', this)`);
      button.appendChild(document.createTextNode('Dar de alta'));
    }
    spcDelete.appendChild(button);
    bloqueMD.appendChild(spcDelete);
    content.appendChild(bloqueMD);
  }
}

//delete an account
function unsuscribeAccount(nick, elemt){
  socket.emit('unsuscribeAccount', nick);
  elemt.setAttribute("class", 'buttonAdd');
  elemt.setAttribute("onclick", `suscribeAccount('nick', this)`);
  elemt.textContent = 'Dar de alta';
}

//delete an account
function suscribeAccount(nick, elemt){
  socket.emit('suscribeAccount', nick);
  elemt.setAttribute("class", 'buttonDelete');
  elemt.setAttribute("onclick", `unsuscribeAccount('nick', this)`);
  elemt.textContent = 'Dar de baja';
}

document.addEventListener('DOMContentLoaded', async () => {
  let inputSearch = document.getElementById('inputSearch');
  inputSearch.addEventListener("keydown", (even) => {
    if (even.key == 'Enter') {
      document.getElementsByClassName('content')[0].textContent = '';
      if (inputSearch.value.trim()[0] == '@'){
        socket.emit('searchByNickAdmin', inputSearch.value.trim().substring(1));
      } else {
        socket.emit('searchByText', inputSearch.value.trim());
      }
    }
  })
  socket.on('returnSearch', function(data){
    showPosts(data);
  });

  socket.on('returnSearchNick', function(data){
    showCardsMDs(data);
  });

});
