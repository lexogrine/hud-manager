"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const high = {
    origin: {
        x: 784.4793452283254,
        y: 255.42597837029027
    },
    pxPerUX: 0.19856123172015677,
    pxPerUY: -0.19820052722907044
};
const low = {
    origin: {
        x: 780.5145858437052,
        y: 695.4259783702903
    },
    pxPerUX: 0.1989615567841087,
    pxPerUY: -0.19820052722907044
};
const config = {
    configs: [
        {
            id: 'high',
            config: high,
            isVisible: (height) => height >= 11700
        },
        {
            id: 'low',
            config: low,
            isVisible: (height) => height < 11700
        }
    ],
    file: ''
};
exports.default = config;
