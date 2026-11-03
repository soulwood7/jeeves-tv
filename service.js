"use strict";
// Permanent loader (pinned in the GitHub tag): fetches the bridge code from jeeves-hub on every service start,
// so the TV-side logic can change without re-adding the module. Node 4 compatible.
var http = require('http'), vm = require('vm');
function load(n) {
  http.get('http://172.27.0.2:8774/bridge.js?t=' + Date.now(), function (res) {
    var b = ''; res.setEncoding('utf8');
    res.on('data', function (c) { b += c; });
    res.on('end', function () {
      try { vm.runInThisContext('(function(require,tizen){' + b + '\n})')(require, tizen); }
      catch (e) { setTimeout(function () { load((n || 0) + 1); }, 15000); }
    });
  }).on('error', function () { setTimeout(function () { load((n || 0) + 1); }, 15000); });
}
load(0);
