"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var node_media_server_1 = __importDefault(require("node-media-server"));
var nmsConfig = {
    logType: 0,
    rtmp: {
        port: 1935,
        chunk_size: 128,
        gop_cache: false,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000,
        allow_origin: '*'
    }
};
var nms = new node_media_server_1["default"](nmsConfig);
nms.run();
