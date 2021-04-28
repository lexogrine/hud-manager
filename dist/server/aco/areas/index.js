"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aco_1 = require("../../api/aco");
const areas = { areas: [] };
aco_1.getACOs().then(acos => {
    areas.areas = acos;
});
exports.default = areas;
