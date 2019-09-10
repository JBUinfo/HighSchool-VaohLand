function loadMore(){
  contador+=50;
  socket.emit('getTL', contador);
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById('logout').addEventListener('click', ()=>{
    document.cookie = 'nick=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/login');
  })
  //once verificated
  socket.on('verificado', function(){
    let nick = document.location.pathname.split('/')[2];
    socket.emit('getFavs');
    socket.emit('getDislikes');
    socket.emit('getTL');
  });

  socket.on('sendMGs', function(mg){
    //make an array full of nulls
    //see library when updates this array
    for (let i = 0; i < mg.length; i++) {
      favs[mg[i]['id_post']] = null;
    }
  });

  socket.on('sendDislikes', function(dis){
    //make an array full of nulls
    //see library when updates this array
    for (let i = 0; i < dis.length; i++) {
      dislikes[dis[i]['id_post']] = null;
    }
  });
  socket.on('refreshTL', function(data){
    if (data.loadMore == 'true') {
      showPosts(data.posts, 'loadMore');
    } else {
      showPosts(data);
    }
  });

});
