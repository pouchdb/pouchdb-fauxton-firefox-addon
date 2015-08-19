/*jshint moz: true, esnext: true */

/*
  Like indexedDB.webkitGetDatabaseNames(), but for use in Firefox
  add-ons and using a promise-based API.
*/

const {Cc, Ci} = require("chrome");
const {URL} = require("sdk/url");

let storageDir = Cc["@mozilla.org/file/directory_service;1"]
  .getService(Ci.nsIProperties)
  .get("ProfD", Ci.nsIFile);
storageDir.append("storage");
storageDir.append("persistent");

if (!storageDir.exists()) {
  // new style directory structure
  storageDir = storageDir.parent;
  storageDir.append("default");
}

const storageService = Cc["@mozilla.org/storage/service;1"]
  .getService(Ci.mozIStorageService);

module.exports = function getIDBDatabaseNames(tab) {
  const result = [];
  if (!tab) {
    return Promise.resolve(result);
  }
  const idbDir = storageDir.clone();
  idbDir.append(new URL(tab.url).origin.replace(/[\/:]/g, "+"));
  idbDir.append("idb");
  console.log(idbDir.path);
  if (!(idbDir.exists() && idbDir.isDirectory())) {
    return Promise.resolve(result);
  }
  const files = idbDir.directoryEntries;
  return new Promise(function (resolve, reject) {
    let total = 0;
    let count = 0;

    const callbacks = {
      handleResult: function (resultSet) {
        result.push(resultSet.getNextRow().getResultByName("name"));
        count += 1;
        if (total === count) {
          resolve(result);
        }
      }
    };
    while (files.hasMoreElements()) {
      const file = files.getNext().QueryInterface(Ci.nsIFile);
      if (!/\.sqlite$/.test(file.leafName)) {
        continue;
      }
      total += 1;
      const connection = storageService.openDatabase(file);
      const stmt = connection.createStatement("SELECT name FROM database");
      stmt.executeAsync(callbacks);
    }
  });
};
