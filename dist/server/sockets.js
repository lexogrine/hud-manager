"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var socket_io_1 = __importDefault(require("socket.io"));
var csgogsi_1 = __importDefault(require("csgogsi"));
var match_1 = require("./api/match");
var mirv = require("./server")["default"];
exports.GSI = new csgogsi_1["default"]();
function default_1(server, app) {
    var last = null;
    var io = socket_io_1["default"](server);
    app.post('/', function (req, res) {
        res.sendStatus(200);
        last = req.body;
        io.emit('update', req.body);
        exports.GSI.digest(req.body);
    });
    io.on('connection', function (socket) {
        socket.on('ready', function () {
            if (last) {
                socket.emit("update", last);
            }
        });
    });
    mirv(function (data) {
        io.emit("update_mirv", data);
    });
    exports.GSI.on("matchEnd", function (score) {
        var match = match_1.getMatchV2();
        var vetos = match.vetos;
        vetos.map(function (veto) {
            if (veto.mapName !== score.map.name) {
                return veto;
            }
            veto.score = score;
            return veto;
        });
        match.vetos = vetos;
        match_1.updateMatch(match);
        io.emit('match', true);
    });
    return io;
}
exports["default"] = default_1;
