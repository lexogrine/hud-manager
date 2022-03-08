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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAR = exports.openARsDirectory = exports.getARModulesAssets = exports.getARModules = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const AR = __importStar(require("./index"));
const getARModules = (req, res) => {
    const ars = AR.listARModules();
    return res.json(ars);
};
exports.getARModules = getARModules;
const getARModulesAssets = async (req, res, next) => {
    if (!req.params.dir) {
        return res.sendStatus(404);
    }
    const data = await AR.getARModuleData(req.params.dir);
    if (!data) {
        return res.sendStatus(404);
    }
    return express_1.default.static(path_1.default.join(electron_1.app.getPath('userData'), 'ARs', req.params.dir))(req, res, next);
};
exports.getARModulesAssets = getARModulesAssets;
const openARsDirectory = async (_req, res) => {
    const dir = path_1.default.join(electron_1.app.getPath('userData'), 'ARs');
    electron_1.shell.openPath(dir);
    return res.sendStatus(200);
};
exports.openARsDirectory = openARsDirectory;
const sendAR = async (req, res) => {
    if (!req.body.ar || !req.body.name)
        return res.sendStatus(422);
    const response = await AR.loadAR(req.body.ar, req.body.name);
    if (response) {
        const notification = new electron_1.Notification({
            title: 'AR Upload',
            body: `${response.name} uploaded successfully`,
            icon: path_1.default.join(__dirname, '../../../assets/icon.png')
        });
        notification.show();
    }
    return res.sendStatus(response ? 200 : 500);
};
exports.sendAR = sendAR;
