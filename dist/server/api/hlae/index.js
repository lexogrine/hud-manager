"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setXrayColors = void 0;
const socket_1 = require("./../../socket");
const xray_1 = require("../../hlae/integration/xray");
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const afxLutFile = path_1.default.join(electron_1.app.getPath('userData'), 'xray.afxlut');
const commands = `mirv_streams actions add glowColorMap blastGlow

mirv_streams actions edit blastGlow load "${afxLutFile}"
mirv_streams actions edit blastGlow normalize 1

mirv_streams add baseFx blast
mirv_streams edit blast forceBuildingCubeMaps 0
mirv_streams edit blast doBloomAndToneMapping 1
mirv_streams edit blast doDepthOfField 1
mirv_streams edit blast actionFilter clear
mirv_streams edit blast actionFilter add "__utilwireframe" blastGlow
mirv_streams edit blast actionFilter add "__utilwireframeignorez" blastGlow
mirv_streams edit blast actionFilter add "__utilvertexcolor" blastGlow
mirv_streams edit blast actionFilter add "__utilvertexcolorignorez" blastGlow
mirv_streams edit blast actionFilter add "dev/glow_color" blastGlow
mirv_streams preview blast

mirv_fix selectedPlayerGlow 0

glow_outline_width 6`
    .split('\n')
    .filter(Boolean);
const setXrayColors = (ctXray, tXray) => {
    (0, xray_1.generateAfxLutFile)(afxLutFile, ctXray, tXray);
    commands.forEach(command => {
        socket_1.mirvPgl.execute(command);
    });
};
exports.setXrayColors = setXrayColors;
