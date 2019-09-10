function loadMore(){
  contador+=50;
  let nick = document.location.pathname.split('/')[2];
  socket.emit('getTLNick', {nick:nick, contador: contador});
}

function deletePost(idPost) {
  let post = document.getElementById(idPost);
  post.parentNode.removeChild(post);
  socket.emit('deletePostAdmin', idPost);
}



document.addEventListener('DOMContentLoaded', async () => {
  let nick = document.location.pathname.split('/')[2];
  socket.on('verificado', function(){
    socket.emit('getTLNick', {nick:nick});
    socket.emit('getPerfil', nick);
  });

  socket.on('sendTLNick', function(data){
    if (data.loadMore == 'true') {
      showPosts(data.msgs, 'loadMore');
    } else {
      showPosts(data);
    }
  });


  socket.on('sendPerfil', function(data){
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

    //biografy
    let biografia = document.getElementById('biografia');
    let i = document.createElement('i');
    i.setAttribute('id', 'biografiaI');
    i.appendChild(document.createTextNode('Biografia: '+ (data.biografia == undefined ? '' : data.biografia) ));
    biografia.appendChild(i);
    boxPerfil.appendChild(biografia);

    //hr
    boxPerfil.appendChild(document.createElement('hr'));

    //nacimiento
    let nacimiento = document.getElementById('nacimiento');
    nacimiento.textContent = 'Cumpleaños: '+data.fecha_cumple;
    boxPerfil.appendChild(nacimiento);
  });
})
