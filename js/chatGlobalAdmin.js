//delete a msg
function deleteMSG(idPost) {
  socket.emit('deleteMSGAdmin', idPost);
}

//save de color to show always the same color to the same user
let nickColor = [];

//show the chat
function showCG(msgs) {

  //Define variables
  const CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

  let todosMsg = document.getElementById('todosMsg');
  let prueba = document.getElementById('prueba');
  let posicion = false;

  //Autoscroll
  if (prueba.scrollTop + prueba.offsetHeight == prueba.scrollHeight  || (prueba.scrollTop + prueba.offsetHeight + 30) >= prueba.scrollHeight) {
    posicion = true;
  }
  //clear chat
  todosMsg.textContent = '';
  let line = '';
  let msg = '';
  let a = '';
  let nick = '';
  let text = '';
  let trash = '';
  let imgTrash = '';
  //Select a color to own user
  for (let i = 0; i < msgs.length; i++) {
    if (nickColor[msgs[i].nick_cliente] == null) {
      nickColor[msgs[i].nick_cliente] = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
    }
  }

  //show the messages
  for (let i = msgs.length-1; i >= 0; i--) {
    //line
    line = document.createElement("div");
    line.setAttribute("class", "line");

    //nick
    a = document.createElement("a");
    a.setAttribute("href", "/nick/"+msgs[i].nick_cliente);

    //if it's me put the class "ownNick"
    msg = document.createElement("div");
    if (msgs[i].nick_cliente == 'admin') {
      msg.setAttribute("class", "ownNick");
    } else {
      msg.setAttribute("class", "msg");
      nick = document.createElement("div");
      nick.setAttribute("class", "nick");
      nick.setAttribute("style", "color:"+nickColor[msgs[i].nick_cliente]);
      nick.appendChild(document.createTextNode('@'+msgs[i].nick_cliente));
      a.appendChild(nick);
      msg.appendChild(a);
    }

    //text of the msg
    text = document.createElement("div");
    text.setAttribute("class", "text");
    text.appendChild(document.createTextNode(msgs[i].texto));
    msg.appendChild(text);

    trash = document.createElement("div");
    trash.setAttribute("class", "trash");
    imgTrash = document.createElement("img");
    imgTrash.setAttribute("src", "/img/trash.png");
    imgTrash.setAttribute("onclick", `deleteMSG('${msgs[i]._id}')`);
    trash.appendChild(imgTrash);
    msg.appendChild(trash);
    line.appendChild(msg);
    todosMsg.appendChild(line);
  }

  //autoscroll
  if (posicion) {
    todosMsg.scrollIntoView({ behavior: 'smooth', block: 'end'});
  }
}

//send new msg
function textSend(socket) {
  let textSend =  document.getElementById('textSend');
  if (textSend.value.trim() != '' && textSend.value.trim() != null) {
    socket.emit('sendMsgAdmin', textSend.value.trim());
    setTimeout(function(){ textSend.value = ''; }, 1);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  socket.on('verificado', function(){
    socket.emit('getCG');
  });

  let todosMsg = document.getElementById('todosMsg');
  todosMsg.scrollTop = todosMsg.scrollHeight;
  document.getElementById('send').addEventListener("click", () => {
    textSend(socket);
  })
  document.addEventListener("keydown", (even) => {
    if (even.key == 'Enter') {
      textSend(socket);
    }
  })

  socket.on('refreshCG', function(data){
    showCG(data);
  });
});
