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
        console.log("RESTAURANT SAVED TO IDb");
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
        console.log(responseJson);
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