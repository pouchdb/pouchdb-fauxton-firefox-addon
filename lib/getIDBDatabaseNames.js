/*jshint moz: true, esnext: true */

/*
  Like indexedDB.webkitGetDatabaseNames(), but for use in Firefox
  add-ons and using a promise-based API.
*/

const {Cc, Ci} = require("chrome");
const {URL} = require("sdk/url");

const persistentStorageDir = Cc["@mozilla.org/file/directory_service;1"]
  .getService(Ci.nsIProperties)
  .get("ProfD", Ci.nsIFile);
persistentStorageDir.append("storage");
persistentStorageDir.append("persistent");

const storageService = Cc["@mozilla.org/storage/service;1"]
  .getService(Ci.mozIStorageService);

module.exports = function getIDBDatabaseNames(tab) {
  var result = [];
  if (!tab) {
    return Promise.resolve(result);
  }
  var idbDir = persistentStorageDir.clone();
  idbDir.append(new URL(tab.url).origin.replace(/[\/:]/g, "+"));
  idbDir.append("idb");
  if (!(idbDir.exists() && idbDir.isDirectory())) {
    return Promise.resolve(result);
  }
  var files = idbDir.directoryEntries;
  return new Promise(function (resolve, reject) {
    var total = 0;
    var count = 0;

    var callbacks = {
      handleResult: function (resultSet) {
        result.push(resultSet.getNextRow().getResultByName("name"));
        count += 1;
        if (total === count) {
          resolve(result);
        }
      }
    };
    while (files.hasMoreElements()) {
      var file = files.getNext().QueryInterface(Ci.nsIFile);
      if (!/\.sqlite$/.test(file.leafName)) {
        continue;
      }
      total += 1;
      var connection = storageService.openDatabase(file);
      var stmt = connection.createStatement("SELECT name FROM database");
      stmt.executeAsync(callbacks);
    }
  });
};
