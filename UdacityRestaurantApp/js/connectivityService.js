showSnackBar = messageText => {
  var snackBar = document.getElementById("snackbar");
  snackBar.className = "show";
  snackBar.innerHTML = messageText;
  setTimeout(() => {
    snackBar.className = snackBar.className.replace("show", "");
  }, 3000);
};

checkConnectivityStatus = () => {
  if (navigator.onLine) {
    //If any request is queued, than Complete those and clear the queue
    sendQueuedRequests = async () => {
      console.log("Making Queued Review requests.");
      var queuedReviews = await ReviewsQueueIDBHelper.getAllData();
      queuedReviews.forEach(review => {
        fetch("http://localhost:1337/reviews/", {
          method: "post",
          body: JSON.stringify(review)
        }).then(() => {
          var dbName = "restaurant-reviews-" + review.restaurant_id;
          idb.delete(dbName);
          console.log("Review List Updated");
        });
      });
    };
    sendQueuedRequests().then(() => {
      var dbName = "reviews-queue";
      idb.delete(dbName);
    });
    showSnackBar("You are currently online!");
  } else {
    showSnackBar(
      "You are currently offline. Any requests made will be queued and synced as soon as you are connected again."
    );
  }
};
window.addEventListener("online", checkConnectivityStatus);
window.addEventListener("offline", checkConnectivityStatus);
checkConnectivityStatus();