let fetchStatus = 0;
class IDbOperationsHelper {
  static checkForIDbSupport() {
    if (!("indexedDB" in window)) {
      return 0;
    } else {
      return 1;
    }
  }
  static openIDb(name, version, objectStoreName) {
    const dbPromise = idb.open(name, version, upgradeDB => {
      upgradeDB.createObjectStore(objectStoreName, { autoIncrement: true });
    });
    return dbPromise;
  }
  static addToDb(dbPromise, objectStoreName, permision, jsonData) {
    dbPromise
      .then(db => {
        const transact = db.transaction(objectStoreName, permision);
        //Add all the json content here
        transact.objectStore(objectStoreName).put(jsonData);
        //
        return transact.complete;
      })
      .then(response => {
        console.log("RESTAURANT SAVED TO LOCAL IDb");
      });
  }
  static getAllData(dbPromise, transactionName, objectStoreName) {
    let responseArrayPromise = dbPromise.then(db =>
      db
        .transaction(transactionName)
        .objectStore(objectStoreName)
        .getAll()
    );
    responseArrayPromise.then(arry => {
      IDbOperationsHelper.setRestaurantsData(arry);
    });
  }
  //
  static getRestaurantsFromServer(
    dbPromise,
    objectStoreName,
    permision,
    callback
  ) {
    let url = "http://localhost:1337/restaurants";
    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJson) {
        responseJson.forEach(restaurant => {
          restaurant = IDbOperationsHelper.addMissingData(restaurant);
        });
        if (fetchStatus != 1) {
          fetchStatus = 1;
          responseJson.forEach(restaurantData => {
            //Here we got json data for every single restaurant
            //Now we add it to IDb
            IDbOperationsHelper.addToDb(
              dbPromise,
              objectStoreName,
              permision,
              restaurantData
            );
          });
        }
        // console.log(responseJson);
        callback(null, responseJson);
      });
  }
  //
  static getRestaurantsData(callback) {
    const idbName = "restaurants-data";
    const dbVersion = 1;
    const objectStoreNameString = "restaurants";
    const transactionNameString = "restaurants";
    const dbPermission = "readwrite";
    let dbPromise = IDbOperationsHelper.openIDb(
      idbName,
      dbVersion,
      objectStoreNameString
    );
    dbPromise
      .then(db =>
        db
          .transaction(transactionNameString)
          .objectStore(objectStoreNameString)
          .getAll()
      )
      .then(responseObejcts => {
        //Here the response is an array
        if (responseObejcts.length <= 0) {
          IDbOperationsHelper.getRestaurantsFromServer(
            dbPromise,
            objectStoreNameString,
            dbPermission,
            callback
          );
        } else {
          callback(null, responseObejcts);
        }
      });
  }
  static addMissingData(restaurantJson) {
    if (!isNaN(restaurantJson.photograph)) {
      restaurantJson.photograph = restaurantJson.photograph + ".jpg";
    } else {
      restaurantJson["photograph"] = restaurantJson.id + ".jpg";
    }
    return restaurantJson;
  }
}

// let fetchStatus = 0;
class ReviewsIDbOperationsHelper {
  static checkForIDbSupport() {
    if (!("indexedDB" in window)) {
      return 0;
    } else {
      return 1;
    }
  }
  static openIDb(name, version, objectStoreName) {
    const dbPromise = idb.open(name, version, upgradeDB => {
      upgradeDB.createObjectStore(objectStoreName, { autoIncrement: true });
    });
    return dbPromise;
  }
  static addToDb(dbPromise, objectStoreName, permision, jsonData) {
    dbPromise
      .then(db => {
        const transact = db.transaction(objectStoreName, permision);
        //Add all the json content here
        transact.objectStore(objectStoreName).put(jsonData);
        //
        return transact.complete;
      })
      .then(response => {
        console.log("REVIEW SAVED TO LOCAL IDb");
      });
  }
  static getAllData(dbPromise, transactionName, objectStoreName) {
    let responseArrayPromise = dbPromise.then(db =>
      db
        .transaction(transactionName)
        .objectStore(objectStoreName)
        .getAll()
    );
    responseArrayPromise.then(arry => {
      IDbOperationsHelper.setRestaurantsData(arry);
    });
  }
  //
  static getReviewsFromServer(
    dbPromise,
    objectStoreName,
    permision,
    callback,
    restaurant_id
  ) {
    let url = "http://localhost:1337/reviews/?restaurant_id=" + restaurant_id;
    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJson) {
        if (fetchStatus != 1) {
          fetchStatus = 1;
          responseJson.forEach(restaurantData => {
            //Here we got json data for every single restaurant
            //Now we add it to IDb
            ReviewsIDbOperationsHelper.addToDb(
              dbPromise,
              objectStoreName,
              permision,
              restaurantData
            );
          });
        }
        // console.log(responseJson);
        callback(null, responseJson);
      });
  }
  //
  static getRestaurantsReviews(callback, restaurant_id) {
    const idbName = "restaurant-reviews-" + restaurant_id;
    const dbVersion = 1;
    const objectStoreNameString = "restaurant-reviews-" + restaurant_id;
    const transactionNameString = "restaurant-reviews-" + restaurant_id;
    const dbPermission = "readwrite";
    let dbPromise = ReviewsIDbOperationsHelper.openIDb(
      idbName,
      dbVersion,
      objectStoreNameString
    );
    dbPromise
      .then(db =>
        db
          .transaction(transactionNameString)
          .objectStore(objectStoreNameString)
          .getAll()
      )
      .then(responseObejcts => {
        //Here the response is an array
        if (responseObejcts.length <= 0) {
          ReviewsIDbOperationsHelper.getReviewsFromServer(
            dbPromise,
            objectStoreNameString,
            dbPermission,
            callback,
            restaurant_id
          );
        } else {
          callback(null, responseObejcts);
        }
      });
  }
}

class ReviewsQueueIDBHelper {
  static checkForIDbSupport() {
    if (!("indexedDB" in window)) {
      return 0;
    } else {
      return 1;
    }
  }
  static openIDb(name, version, objectStoreName) {
    const dbPromise = idb.open(name, version, upgradeDB => {
      upgradeDB.createObjectStore(objectStoreName, { autoIncrement: true });
    });
    return dbPromise;
  }
  static addToDb(dbPromise, objectStoreName, permision, jsonData) {
    dbPromise
      .then(db => {
        const transact = db.transaction(objectStoreName, permision);
        //Add all the json content here
        transact.objectStore(objectStoreName).put(jsonData);
        //
        return transact.complete;
      })
      .then(response => {
        console.log("REVIEW SAVED TO LOCAL IDb");
      });
  }
  static getAllData() {
    const idbName = "reviews-queue";
    const dbVersion = 1;
    const objectStoreNameString = "reviews";
    const transactionNameString = "reviews";
    const dbPermission = "readwrite";
    let dbPromise = ReviewsIDbOperationsHelper.openIDb(
      idbName,
      dbVersion,
      objectStoreNameString
    );
    //
    let responseArrayPromise = dbPromise.then(db =>
      db
        .transaction(transactionNameString)
        .objectStore(objectStoreNameString)
        .getAll()
    );
    return responseArrayPromise;
  }
  //
  static queueReviewRequest(jsonRequest) {
    const idbName = "reviews-queue";
    const dbVersion = 1;
    const objectStoreNameString = "reviews";
    const transactionNameString = "reviews";
    const dbPermission = "readwrite";
    let dbPromise = ReviewsIDbOperationsHelper.openIDb(
      idbName,
      dbVersion,
      objectStoreNameString
    );
    dbPromise.then(db => {
      ReviewsQueueIDBHelper.addToDb(dbPromise, objectStoreNameString, dbPermission, jsonRequest);
    });
  }
}