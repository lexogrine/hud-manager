"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var publicKey = fs_1["default"].readFileSync(path_1["default"].join(__dirname, 'jwtRS256.key.pub'));
exports.publicKey = publicKey;
