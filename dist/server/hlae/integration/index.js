"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdvancedFXInstallation = exports.afxExecutable = exports.hlaeExecutable = exports.useIntegrated = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
// import fetch from 'node-fetch';
const github_1 = require("./github");
const userData = electron_1.app.getPath('userData');
exports.useIntegrated = false;
exports.hlaeExecutable = path_1.default.join(userData, 'hlae', 'HLAE.exe');
exports.afxExecutable = path_1.default.join(userData, 'afx', 'Release', 'afx-cefhud-interop.exe');
const findHLAEAsset = (asset) => {
    return asset.content_type === 'application/x-zip-compressed';
};
const findAFXAsset = (asset) => {
    return asset.name === 'Release.7z';
};
const verifyHLAEInstallation = (win) => (0, github_1.verifyInstallation)('advancedfx/advancedfx', path_1.default.join(userData, 'hlae'), findHLAEAsset, win).then(result => {
    console.log('HLAE INSTALLATION STAUTS', result);
});
const verifyAFXInstallation = async (win) => {
    /*const releases = (await fetch('https://api.github.com/repos/advancedfx/afx-cefhud-interop/releases').then(res =>
        res.json()
    )) as components['schemas']['release'][];
    const latestReleaseWithExecutable = releases.find(release => release.assets.find(findAFXAsset));
    if (!latestReleaseWithExecutable) {
        console.log('No AFX executables found');
        return;
    }*/
    return (0, github_1.verifyInstallation)('advancedfx/afx-cefhud-interop', path_1.default.join(userData, 'afx'), findAFXAsset, win, 'v7.0.0.17-4dcfd4d').then(result => {
        console.log('AFX INSTALLATION STATUS', result);
    });
};
const verifyAdvancedFXInstallation = async (win) => {
    await verifyHLAEInstallation(win);
    await verifyAFXInstallation(win);
};
exports.verifyAdvancedFXInstallation = verifyAdvancedFXInstallation;
