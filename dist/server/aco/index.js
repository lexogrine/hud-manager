"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDirector = void 0;
const director_1 = require("./director");
const socket_1 = require("../socket");
const createDirector = () => {
    return new director_1.Director(socket_1.GSI);
};
exports.createDirector = createDirector;
