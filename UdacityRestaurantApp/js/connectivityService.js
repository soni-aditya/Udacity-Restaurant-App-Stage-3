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

//If any request is queued, than Complete those and clear the queue
// async function sendQueuedRequests() {
//   console.log("Making Queued Review requests.");
//   var queuedReviews = await ReviewsQueueIDBHelper.getAllData();
//   for (var i = 0; i < queuedReviews.length; i++) {
//     console.log("review request made");
//     var thisRestaurantId = JSON.parse(queuedReviews[i].restaurant_id);
//     fetch("http://localhost:1337/reviews/", {
//       method: "post",
//       body: JSON.stringify(queuedReviews[i])
//     })
//       .then(() => {
//         var dbName = "restaurant-reviews-" + thisRestaurantId;
//         //Delete iDB and reload the page
//         idb.delete(dbName).then(() => {});
//       })
//       .catch(err => console.log(err));
//   }
// }
// sendQueuedRequests().then(() => {
//   var dbName = "reviews-queue";
//   // idb.delete(dbName).then(() => {
//   //   console.log("IDB Deleted");
//   if (window.location.pathname == "/restaurant.html") {
//     const idbName = "reviews-queue";
//     const dbVersion = 1;
//     const objectStoreNameString = "reviews";
//     const transactionNameString = "reviews";
//     const dbPermission = "readwrite";
//     let dbPromise = ReviewsIDbOperationsHelper.openIDb(
//       idbName,
//       dbVersion,
//       objectStoreNameString
//     );
//     dbPromise.then(db => {
//       idb.delete(dbName).then(() => {
//         location.reload();
//       });
//     });
//   }
//   // });
// });
//
