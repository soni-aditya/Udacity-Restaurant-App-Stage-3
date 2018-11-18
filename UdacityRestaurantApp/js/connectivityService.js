class CheckConnectivity {
  checkStatus = () => {
    if (navigator.onLine) {
      this.showSnackBar("Application is online.");
    } else {
      this.showSnackBar("No network connection available.");
    }
  };
  showSnackBar = messageText => {
    var snackBar = document.getElementById("snackbar");
    snackBar.className = "show";
    snackBar.innerHTML = messageText;
    setTimeout(() => {
      snackBar.className = snackBar.className.replace("show", "");
    }, 3000);
  };
}
