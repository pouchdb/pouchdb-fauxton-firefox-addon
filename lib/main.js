"use strict";

/*jshint moz: true, node: true */

const {Panel} = require("dev/panel");
const {Tool} = require("dev/toolbox");
const {extend} = require("sdk/core/heritage");
const self = require("sdk/self");
const {MessageChannel} = require("sdk/messaging");
const tabs = require("sdk/tabs");
const {setTimeout} = require("sdk/timers");

const getIDBDatabaseNames = require("./getIDBDatabaseNames.js");
const PostMessageRPC = require("./external/postmessagerpc.js");

const rpc = new PostMessageRPC(postToBoth, "main");
rpc.serve("getIDBDatabaseNames", function () {
  return getIDBDatabaseNames(tab);
});

function postToBoth(msg) {
  postToDevTool(msg);
  postToPage(msg);
}

var tab, pageWorker, devToolSide;

function postToDevTool(msg) {
  rpc.onMessage(msg);
  waitForDevToolSide(function () {
    devToolSide.postMessage(msg);
  });
}

function waitForDevToolSide(cb) {
  if (devToolSide) {
    return cb();
  }
  setTimeout(waitForDevToolSide.bind(null, cb), 0);
}

function postToPage(msg) {
  try {
    pageWorker.postMessage(msg.data || msg);
  } catch (err) {
    setTimeout(postToPage.bind(null, msg), 0);
  }
  rpc.onMessage(msg);
}

function cleanupPageWorker() {
  if (pageWorker) {
    pageWorker.destroy();
  }
}

function injectCode() {
  cleanupPageWorker();

  //inject req2resp code
  pageWorker = tab.attach({
    contentScriptFile: "contentscript.js",
    onError: function(error) {
      //For debugging
      console.log(error.fileName + ":" + error.lineNumber + ": " + error);
    },
    onMessage: postToDevTool
  });
  pageWorker.postMessage({
    isevalscript: true,
    src: self.data.url("generated/eval.js")
  });
}

function onTabReady() {
  injectCode();

  rpc.call("devtool", "reload");
  devToolSide = null;
}

function PouchDBPanel() {}

PouchDBPanel.prototype = extend(Panel.prototype, {
  label: "PouchDB",
  tooltip: "Inspect the PouchDB databases in the current page.",
  icon: self.data.url("icon.png"),
  url: self.data.url("generated/fauxton/index.html"),
  setup: function () {
    tab = tabs.activeTab;

    //handle refresh
    tab.on("ready", onTabReady);

    //inject code
    injectCode();
  },
  dispose: function () {
    //stop handling refresh
    tab.removeListener("ready", onTabReady);

    //de-inject
    cleanupPageWorker();
  },
  onReady: function () {
    var channel = new MessageChannel();
    devToolSide = channel.port1;
    devToolSide.addEventListener("message", postToPage);
    devToolSide.start();

    this.postMessage("port changed", [channel.port2]);
  }
});

const pouchdbTool = new Tool({
  panels: {
    pouchdbPanel: PouchDBPanel
  }
});
