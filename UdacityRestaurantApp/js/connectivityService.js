showSnackBar = messageText => {
  var snackBar = document.getElementById("snackbar");
  snackBar.className = "show";
  snackBar.innerHTML = messageText;
  setTimeout(() => {
    snackBar.className = snackBar.className.replace("show", "");
  }, 3000);
};


checkConnectivityStatus = () =>{
  if (navigator.onLine) {
    showSnackBar("You are currently online!");
  } else {
    showSnackBar(
      "You are currently offline. Any requests made will be queued and synced as soon as you are connected again."
    );
  }
}
window.addEventListener("online", checkConnectivityStatus);
window.addEventListener("offline", checkConnectivityStatus);
checkConnectivityStatus();
