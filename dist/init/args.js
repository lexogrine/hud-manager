"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
function default_1(argv) {
    const args = yargs_1.default(argv).boolean('noGUI').boolean('dev').argv;
    return args;
}
exports.default = default_1;
