document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById('logout').addEventListener('click', ()=>{
    document.cookie = 'nick=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/login');
  })
  let inputSearch = document.getElementById('inputSearch');
    inputSearch.addEventListener("keydown", (even) => {
      if (even.key == 'Enter') {
        document.getElementsByClassName('content')[0].textContent = '';
        if (inputSearch.value.trim()[0] == '@'){
          socket.emit('searchByNick', inputSearch.value.trim().substring(1));
        } else {
          socket.emit('searchByText', inputSearch.value.trim());
        }
      }
    })
    socket.on('returnSearch', function(data){
      showPosts(data);
    });
});
