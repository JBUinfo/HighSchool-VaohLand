//Show th cards
function showCardsMDs(data){
  let card = '';
  let spcMD = '';
  let center = '';
  let a = '';
  let imgPerfil = '';
  let nickPerfil = '';
  let img = '';
  let button = '';
  let bckMDs = document.getElementById('bckMDs');
  for (let i = 0; i < data.length; i++) {
    //box
    bloqueMD = document.createElement("div");
    bloqueMD.setAttribute("class", "bloqueMD");
    //middle-up
    spcMD = document.createElement("div");
    spcMD.setAttribute("class", "spcMD");
    center = document.createElement("div");
    center.setAttribute("class", "center");
    imgPerfil = document.createElement("div");
    imgPerfil.setAttribute("class", "imgPerfil");
    img = document.createElement("img");
    img.setAttribute("src", '/uploads\\'+data[i].img_perfil);
    imgPerfil.appendChild(img);
    center.appendChild(imgPerfil);
    nickPerfil = document.createElement("div");
    nickPerfil.setAttribute("class", "nickPerfil");
    nickPerfil.appendChild(document.createTextNode('@'+data[i].nick));
    center.appendChild(nickPerfil);
    spcMD.appendChild(center);
    a = document.createElement("a");
    a.setAttribute("href", "/nick/"+data[i].nick);
    a.appendChild(spcMD);
    bloqueMD.appendChild(a);
    //hr
    bloqueMD.appendChild(document.createElement("hr"));

    //middle-down
    spcMD = document.createElement("div");
    spcMD.setAttribute("class", "spcMD");
    button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("class", "buttonMD");
    button.setAttribute("onclick", `showChat('${data[i].nick}')`);
    button.appendChild(document.createTextNode('Enviar MD'));
    spcMD.appendChild(button);
    bloqueMD.appendChild(spcMD);
    bckMDs.appendChild(bloqueMD);
  }
}



document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById('logout').addEventListener('click', ()=>{
    document.cookie = 'nick=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/login');
  })
  
  socket.on('verificado', function(){
    let nick = document.location.pathname.split('/')[2];
    socket.emit('getMDs');
  });

  socket.on('sendMDs', function(data){
    showCardsMDs(data);
  });

})
