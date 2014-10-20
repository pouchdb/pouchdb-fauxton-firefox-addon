"use strict";

/*jshint node: true, browser: true */
/*globals self */

self.on("message", function (msg) {
  if (msg.isevalscript) {
    var scr = document.createElement("script");
    scr.src = msg.src;
    document.head.appendChild(scr);

    return;
  }
  window.postMessage(msg, "*");
});

window.addEventListener("message", function (msg) {
  self.postMessage(msg.data);
});
