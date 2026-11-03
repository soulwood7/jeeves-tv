"use strict";
// Jeeves TV bridge: runs inside TizenBrew's Node service (has tizen). Local HTTP on 127.0.0.1:8085 so the
// launcher page (served by jeeves-hub) can list and launch TV apps. Node 4 compatible (ES5).
var http = require('http'), url = require('url');
function send(res, code, obj) {
  res.writeHead(code, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(obj));
}
var srv = http.createServer(function (req, res) {
  var u = url.parse(req.url, true);
  try {
    if (u.pathname === '/ping') return send(res, 200, {ok: true, tizen: typeof tizen});
    if (u.pathname === '/apps') {
      return tizen.application.getAppsInfo(function (l) {
        send(res, 200, {ok: true, apps: l.map(function (a) { return {id: a.id, name: a.name, pkg: a.packageId, show: a.show}; })});
      }, function (e) { send(res, 500, {ok: false, err: e.message}); });
    }
    if (u.pathname === '/launch') {
      var id = u.query.id;
      return tizen.application.launch(id, function () { send(res, 200, {ok: true, id: id}); },
        function (e) { send(res, 500, {ok: false, id: id, err: e.name + ': ' + e.message}); });
    }
    if (u.pathname === '/control') {
      var ac = new tizen.ApplicationControl(u.query.op || 'http://tizen.org/appcontrol/operation/view', u.query.uri || null);
      return tizen.application.launchAppControl(ac, u.query.id || null, function () { send(res, 200, {ok: true}); },
        function (e) { send(res, 500, {ok: false, err: e.name + ': ' + e.message}); });
    }
    send(res, 404, {ok: false});
  } catch (e) { send(res, 500, {ok: false, err: String(e)}); }
});
srv.on('error', function () {});
srv.listen(8085, '127.0.0.1');
