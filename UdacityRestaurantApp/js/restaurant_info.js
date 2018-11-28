let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  initMap();
});
/*
Adding a service worker if not present
 */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./restaurant-review-sw.js", { scope: "/" })
    .then(function(registration) {
      // console.log("Service Worker Registeration",registration);
      console.log("Service Worker Registeration");
    })
    .catch(function(err) {
      console.log("Service Worker Registion Error Code :", err);
    });
} else {
  console.log("Service Workers not supported");
}
/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map("map", {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
        {
          // mapboxToken: '<your MAPBOX API KEY HERE>',
          mapboxToken:
            "pk.eyJ1IjoiYWRpdHlhMjM0IiwiYSI6ImNqams1b2tvdTBwNjgzd3M0ZnE5Y2F4MXUifQ.z-60z-exBnVdmCP1LrsB3w",
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: "mapbox.streets"
        }
      ).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
  launchFeedbackModal();
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
let currentFavouriteStatus = "";
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  let favourite = document.getElementById("is-favourite");
  if (currentFavouriteStatus == "") {
    currentFavouriteStatus = restaurant.is_favorite;
  }
  console.log("Current Fav Status : " + currentFavouriteStatus);
  if (currentFavouriteStatus == "true") {
    favourite.classList.add("fa");
  } else {
    favourite.classList.add("far");
  }

  favourite.onclick = () => {
    console.log("INITIALLY : " + restaurant);
    currentFavouriteStatus =
      currentFavouriteStatus == "true" ? "false" : "true";
    var restaurantId = getParameterByName("id");
    let newFavRequest =
      "http://localhost:1337/restaurants/" +
      restaurantId +
      "/?is_favorite=" +
      currentFavouriteStatus;
    console.log(newFavRequest);
    // Making a PUT request
    fetch(newFavRequest, {
      method: "PUT"
    }).then(response => {
      console.log("LATER : " + restaurant);
      if (favourite.classList.contains("far")) {
        favourite.classList.remove("far");
        favourite.classList.add("fa");
      } else {
        favourite.classList.remove("fa");
        favourite.classList.add("far");
      }
      //Delete iDB and reload the page
      dbName = "restaurants-data";
      idb.delete(dbName).then(() => {
        console.log("IDB Deleted");
      });
    });
  };

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.alt = "Image of " + restaurant.name + " restaurant";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  var restaurantId = getParameterByName("id");

  DBHelper.getReviewForRestaurant((error, reviews) => {
    if (!reviews) {
      console.error(error);
      return;
    } else {
      const container = document.getElementById("reviews-container");
      if (reviews.length == 0) {
        const noReviews = document.createElement("p");
        noReviews.innerHTML = "No reviews yet!";
        container.appendChild(noReviews);
        return;
      }
      const ul = document.getElementById("reviews-list");
      reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
    }
  }, restaurantId);
};

/**
 * Create Rating Html
 */
createRatingHtml = rating => {
  let innerHtmlContent = "<b>Ratings : <b>" + rating + "/5<br>";
  for (let i = 1; i <= rating; i++) {
    innerHtmlContent = innerHtmlContent + '<i class="fas fa-star"></i>';
  }
  if (rating < 5) {
    const remaining = 5 - rating;
    for (let i = 1; i <= remaining; i++) {
      innerHtmlContent = innerHtmlContent + '<i class="far fa-star"></i>';
    }
  }
  return innerHtmlContent;
};
/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");

  const intro_div = document.createElement("div");
  intro_div.className = "intro";

  const name = document.createElement("p");
  name.innerHTML = review.name;
  name.className = "person-name";
  // li.appendChild(name);

  const date = document.createElement("p");
  if (review.createdAt) {
    date.innerHTML = review.createdAt;
  } else {
    var today = new Date();
    var dateToday =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = dateToday + " " + time;
    date.innerHTML = dateTime;
  }
  date.className = "date-of-review";
  // li.appendChild(date);
  intro_div.appendChild(name);
  intro_div.appendChild(date);
  li.appendChild(intro_div);

  const rating = document.createElement("p");
  rating.innerHTML = createRatingHtml(review.rating);
  rating.className = "review-rating";
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  comments.className = "review-comment";
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};
///Launching feedback modal
launchFeedbackModal = () => {
  var modal = document.getElementById("feedbackModal");
  var modalTrigger = document.getElementById("modalTrigger");
  var span = document.getElementsByClassName("close")[0];
  var feedbackFormButton = document.getElementById("feedbackFormButton");
  var rating = document.getElementById("rating");
  var feedbackContent = document.getElementById("feedbackContent");
  var userName = document.getElementById("userName");
  modalTrigger.onclick = function() {
    modal.style.display = "block";
  };
  span.onclick = function() {
    modal.style.display = "none";
  };
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  var restaurantId = getParameterByName("id");
  ///On form subbmission
  feedbackFormButton.onclick = function() {
    var ratingValue = rating.value;
    var feedback = feedbackContent.value;
    var user = userName.value;
    var requestPayload = {
      restaurant_id: restaurantId,
      name: user,
      rating: ratingValue,
      comments: feedback
    };
    //If application is online, make an API call
    if (navigator.onLine) {
      fetch("http://localhost:1337/reviews/", {
        method: "post",
        body: JSON.stringify(requestPayload)
      }).then(() => {
        showSnackBar("Your review has been recorded!");
        var dbName = "restaurant-reviews-" + restaurantId;
        //Delete iDB and reload the page
        idb.delete(dbName).then(() => {
          console.log("IDB Deleted");
          location.reload();
        });
      });
    }
    //If API is offline, save the payload into local IDB storage
    //Later when system comes online,
    //make a request to queue requests for all the payloads stored in IDB
    else {
      ReviewsQueueIDBHelper.queueReviewRequest(requestPayload);
      showSnackBar("Your review has been recorded!");
      location.reload();
    }
  };
};
