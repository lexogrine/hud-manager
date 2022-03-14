"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdvancedFXInstallation = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const github_1 = require("./github");
const findHLAEAsset = (asset) => {
    return asset.content_type === 'application/x-zip-compressed';
};
const findAFXAsset = (asset) => {
    return asset.name === 'Release.7z';
};
const verifyHLAEInstallation = () => (0, github_1.verifyInstallation)('advancedfx/advancedfx', path_1.default.join(electron_1.app.getPath('userData'), 'hlae'), findHLAEAsset).then(result => {
    console.log("HLAE INSTALLATION STAUTS", result);
});
const verifyAFXInstallation = async () => {
    const releases = await (0, node_fetch_1.default)('https://api.github.com/repos/advancedfx/afx-cefhud-interop/releases').then(res => res.json());
    const latestReleaseWithExecutable = releases.find(release => release.assets.find(findAFXAsset));
    if (!latestReleaseWithExecutable) {
        console.log("No AFX executables found");
        return;
    }
    return (0, github_1.verifyInstallation)('advancedfx/afx-cefhud-interop', path_1.default.join(electron_1.app.getPath('userData'), 'afx'), findAFXAsset, latestReleaseWithExecutable.tag_name).then(result => {
        console.log("AFX INSTALLATION STATUS", result);
    });
};
const verifyAdvancedFXInstallation = async () => {
    await verifyHLAEInstallation();
    await verifyAFXInstallation();
};
exports.verifyAdvancedFXInstallation = verifyAdvancedFXInstallation;
