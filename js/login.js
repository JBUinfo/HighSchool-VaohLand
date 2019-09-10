document.addEventListener("DOMContentLoaded", async () => {
  const socket = io('http://localhost:3000');
  document.addEventListener("keydown", (even) => {
    if (even.key == 'Enter') {
      socket.emit('login', {
        nick: document.getElementById('nick').value,
        password: document.getElementById('password').value
      });
    }
  })

  document.getElementById('Login').addEventListener("click", (evet) => {
    socket.emit('login', {
      nick: document.getElementById('nick').value,
      password: document.getElementById('password').value
    });
  });

  socket.on('loginVerify', function(data){
    if (data) {
      let date = new Date();
      date.setTime(date.getTime()+(1*24*60*60*1000));
      expires = date.toGMTString();
      document.cookie = `session=${data._id} ; expires=${expires} `;
      document.cookie = `nick=${data.nick} ; expires=${expires}`;
      location.replace("/");
    } else {
      document.getElementById('error').textContent = 'Usuario o contrasena incorrecta';
    }
  });

  socket.on('baja', function(data){
      document.getElementById('error').textContent = 'Usuario dado de baja. Contacte con un administrador para mas informacion.';
  });

});
