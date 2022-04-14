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
exports.verifyInstallation = void 0;
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const util_1 = require("util");
const electron_1 = require("electron");
const node_fetch_1 = __importDefault(require("node-fetch"));
//let { zip, unzip } = require('cross-unzip')
const { unzip } = require('cross-unzip');
const archivesDirectory = path_1.default.join(electron_1.app.getPath('userData'), 'archives');
const streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
const remove = (pathToRemove, leaveRoot = false) => {
    if (!fs_1.default.existsSync(pathToRemove)) {
        return;
    }
    const files = fs_1.default.readdirSync(pathToRemove);
    files.forEach(function (file) {
        const current = path_1.default.join(pathToRemove, file);
        if (fs_1.default.lstatSync(current).isDirectory()) {
            // recurse
            remove(current);
            if (fs_1.default.existsSync(current))
                fs_1.default.rmdirSync(current);
        }
        else {
            // delete file
            if (fs_1.default.existsSync(current))
                fs_1.default.unlinkSync(current);
        }
    });
    if (!leaveRoot)
        fs_1.default.rmdirSync(pathToRemove);
};
const fetchAsset = async (url, path) => {
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok)
        return false;
    await streamPipeline(response.body, (0, fs_1.createWriteStream)(path));
    return true;
};
const clearCurrentInstallation = (path) => {
    remove(path, true);
};
const updateAsset = async (asset, directory, version) => {
    const archivePath = path_1.default.join(archivesDirectory, asset.name);
    const result = await fetchAsset(asset.browser_download_url, archivePath);
    if (!result)
        return false;
    clearCurrentInstallation(directory);
    return new Promise(res => {
        unzip(archivePath, directory, (err) => {
            console.log(err);
            remove(archivesDirectory, true);
            if (!err) {
                const versionFilePath = path_1.default.join(directory, 'version');
                fs_1.default.writeFileSync(versionFilePath, version, 'utf-8');
            }
            res(!err);
        });
    });
};
const verifyInstallation = async (repo, directory, findAsset, win, tag) => {
    const githubURL = tag
        ? `https://api.github.com/repos/${repo}/releases/tags/${tag}`
        : `https://api.github.com/repos/${repo}/releases/latest`;
    const response = (await (0, node_fetch_1.default)(githubURL).then(res => res.json()));
    console.log(`Looking for ${repo} releases`);
    if (!response?.tag_name)
        return null;
    console.log(`Found ${repo}`, response.tag_name);
    const versionFilePath = path_1.default.join(directory, 'version');
    try {
        const content = fs_1.default.readFileSync(versionFilePath, 'utf-8');
        if (content === response.tag_name)
            return true;
    }
    catch { }
    console.log(`No current ${repo} detected`);
    const asset = response.assets?.find(findAsset);
    if (!asset)
        return true;
    console.log(`Found asset for ${repo}, downloading`);
    const result = await updateAsset(asset, directory, response.tag_name);
    return result;
};
exports.verifyInstallation = verifyInstallation;
