"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHLAEStatus = exports.setXrayHandler = void 0;
const __1 = require("..");
const socket_1 = require("../../socket");
const HLAE = __importStar(require("./index"));
const setXrayHandler = (req, res) => {
    if (__1.customer?.customer?.license.type !== 'enterprise' &&
        __1.customer?.customer?.license.type !== 'professional' &&
        !__1.customer?.workspace)
        return res.sendStatus(403);
    const tXray = [...req.body.tXray];
    const ctXray = [...req.body.ctXray];
    HLAE.setXrayColors(ctXray, tXray);
    return res.sendStatus(200);
};
exports.setXrayHandler = setXrayHandler;
const getHLAEStatus = (req, res) => {
    return res.json({ connected: !!socket_1.mirvPgl.socket });
};
exports.getHLAEStatus = getHLAEStatus;
