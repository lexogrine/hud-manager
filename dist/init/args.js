"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var yargs_1 = __importDefault(require("yargs"));
function default_1(argv) {
    var args = yargs_1["default"](argv).boolean("noGui").argv;
    return args;
}
exports["default"] = default_1;
