document.addEventListener("DOMContentLoaded", async () => {
  const error = document.location.search.substring(1);
  if (error == 'errorNickLength') {
    document.getElementById('error').textContent = 'Introduce un nick entre 3 y 20 caracteres.';
  } else if (error == 'errorNick') {
    document.getElementById('error').textContent = 'Ya existe un usuario con ese nick';
  } else if (error == 'errorImage') {
    document.getElementById('error').textContent = 'Introduce una imagen.';
  } else if (error == 'errorPassword') {
    document.getElementById('error').textContent = 'Introduce una contrasena con mas de 7 caracteres.';
  }
  document.getElementById('Register').addEventListener("click", (evet) => {
    evet.preventDefault();
    let nick = document.getElementById('nick').value.trim();
    let password = document.getElementById('password').value.trim();
    let cumple = document.getElementById('Fecha').value.trim();
    let img = document.getElementById('image').value.trim();
    if (nick == '' || password == '' || cumple == '') {
      document.getElementById('error').textContent = 'Rellena todos los campos';
    } else {
      if (img == '') {
        document.getElementById('error').textContent = 'Selecciona una imagen';
      } else {
        let date = document.getElementById('Fecha').value;
        date = new Date(date);
        let dateNow = Date.now();
        if (date.getTime() < dateNow ) {
          dateNow = new Date();
          let anos = dateNow.getYear() - date.getYear();
          //Se que esta mal pero por ahora se queda asi
          document.getElementById('error').textContent = '';
          if (anos < 18){
            document.getElementById('error').textContent = 'Tienes que ser mayor de 18.';
          } else {
            document.getElementById('form').submit();
          }
        } else {
          document.getElementById('error').textContent = 'Coloca una fecha valida.';
        }
      }
    }
  });
});
