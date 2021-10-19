"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Change directory to make sure ./ is working correctly
const process_1 = __importDefault(require("process"));
process_1.default.chdir("../../..");
const MacKeyServer_1 = require("../MacKeyServer");
var v = new MacKeyServer_1.MacKeyServer(function (e) {
    console.log(e);
    if (e.name == "B")
        v.stop(); //Quit on B press
    return e.name == "A"; //Capture only A keys
});
v.start();
