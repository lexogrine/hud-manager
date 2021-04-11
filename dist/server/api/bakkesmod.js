"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSosPlugin = exports.installBakkesMod = exports.downloadSosPlugin = exports.downloadBakkesMod = exports.checkStatus = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const request_1 = __importDefault(require("request"));
const del_1 = __importDefault(require("del"));
const child_process_1 = require("child_process");
const DecompressZip = require('decompress-zip');
const tempDirPath = electron_1.app.getPath('temp');
const bakkesModDirPath = path_1.default.join(process.env.APPDATA || '', '/bakkesmod/bakkesmod');
const bakkesModConfigPath = path_1.default.join(bakkesModDirPath, 'cfg/plugins.cfg');
const bakkesModDownloadUrl = 'https://github.com/bakkesmodorg/BakkesModInjectorCpp/releases/latest/download/BakkesModSetup.exe';
const bakkesModDownloadFilePath = path_1.default.join(tempDirPath, 'lhm_bakkesmod.exe');
const bakkesModPath = path_1.default.join(bakkesModDirPath, 'BakkesMod.exe');
const sosPluginFiles = ['plugins/SOS.dll', 'plugins/settings/sos.set'];
const sosPluginConfig = 'plugin load sos';
const sosPluginDownloadAPIPath = 'https://gitlab.com/api/v4/projects/16389912/releases';
const sosPluginDownloadUrlPrefix = 'https://gitlab.com/bakkesplugins/sos/sos-plugin';
const sosPluginDownloadFilePath = path_1.default.join(tempDirPath, 'lhm_sosplugin.zip');
const sosPluginExtractPath = path_1.default.join(tempDirPath, 'lhm_sosplugin_unpack');
const move = (oldPath, newPath, overwrite) => {
    return new Promise((resolve, reject) => {
        const justMove = () => {
            fs_1.default.rename(oldPath, newPath, err => {
                if (err) {
                    if (err.code === 'EXDEV') {
                        const readStream = fs_1.default.createReadStream(oldPath);
                        const writeStream = fs_1.default.createWriteStream(newPath);
                        readStream.on('error', () => {
                            return reject();
                        });
                        writeStream.on('error', () => {
                            return reject();
                        });
                        readStream.on('close', () => fs_1.default.unlink(oldPath, () => {
                            return resolve();
                        }));
                        readStream.pipe(writeStream);
                    }
                    else {
                        console.log('Move error for:', oldPath, 'to', newPath, '>', err);
                        return reject(err);
                    }
                }
                else
                    return resolve();
            });
        };
        if (overwrite)
            fs_1.default.unlink(newPath, justMove);
        else
            justMove();
    });
};
const verifyPluginList = () => {
    if (!fs_1.default.existsSync(bakkesModConfigPath))
        return false;
    if (fs_1.default.readFileSync(bakkesModConfigPath).indexOf(sosPluginConfig) === -1)
        return false;
    return true;
};
exports.checkStatus = async (req, res) => {
    const status = {
        bakkesModDownloaded: false,
        bakkesModInstalled: false,
        sosPluginDownloaded: false,
        sosPluginInstalled: false,
        sosConfigSet: false,
        bakkesModRunning: false
    };
    if (fs_1.default.existsSync(bakkesModDownloadFilePath))
        status.bakkesModDownloaded = true;
    if (fs_1.default.existsSync(sosPluginDownloadFilePath))
        status.sosPluginDownloaded = true;
    if (fs_1.default.existsSync(bakkesModPath))
        status.bakkesModInstalled = true;
    if (fs_1.default.existsSync(path_1.default.join(bakkesModDirPath, sosPluginFiles[0])))
        status.sosPluginInstalled = true;
    if (verifyPluginList())
        status.sosConfigSet = true;
    return res.json({ success: true, status });
};
exports.downloadBakkesMod = async (req, res) => {
    request_1.default(bakkesModDownloadUrl)
        .on('error', () => {
        return res.json({ success: false });
    })
        .on('end', () => {
        return res.json({ success: true, path: bakkesModDownloadFilePath });
    })
        .pipe(fs_1.default.createWriteStream(bakkesModDownloadFilePath));
};
exports.downloadSosPlugin = async (req, res) => {
    request_1.default(sosPluginDownloadAPIPath, (error, _response, body) => {
        if (error)
            return res.json({ success: false });
        const results = JSON.parse(body);
        const partialUrl = results[0].description.match(/\/uploads\/.+?\.zip/);
        const url = sosPluginDownloadUrlPrefix + partialUrl;
        request_1.default(url)
            .on('error', () => {
            return res.json({ success: false });
        })
            .on('end', () => {
            return res.json({ success: true, path: sosPluginDownloadFilePath });
        })
            .pipe(fs_1.default.createWriteStream(sosPluginDownloadFilePath));
    });
};
exports.installBakkesMod = async (req, res) => {
    if (!fs_1.default.existsSync(bakkesModDownloadFilePath))
        return res.json({ success: false, message: 'BakkesMod needs to be downloaded first' });
    child_process_1.execFile(bakkesModDownloadFilePath, (error, _stdout, _stderr) => {
        if (error) {
            return res.json({ success: false, message: 'Failed to install BakkesMod', error });
        }
        if (!fs_1.default.existsSync(bakkesModConfigPath)) {
            return res.json({ success: false, message: 'BakkesMod installation failed' });
        }
        return res.json({ success: true });
    });
};
exports.installSosPlugin = async (req, res) => {
    if (!fs_1.default.existsSync(sosPluginDownloadFilePath))
        return res.json({ success: false, message: 'SOS plugin needs to be downloaded first' });
    if (fs_1.default.existsSync(sosPluginExtractPath)) {
        await del_1.default(sosPluginExtractPath, { force: true, expandDirectories: true });
        await del_1.default(sosPluginExtractPath, { force: true });
    }
    fs_1.default.mkdirSync(sosPluginExtractPath);
    const unzipper = new DecompressZip(sosPluginDownloadFilePath);
    unzipper.on('extract', async () => {
        try {
            await Promise.all(sosPluginFiles.map(f => move(path_1.default.join(sosPluginExtractPath, f), path_1.default.join(bakkesModDirPath, f), true)));
            if (!verifyPluginList()) {
                fs_1.default.appendFileSync(bakkesModConfigPath, '\n' + sosPluginConfig + '\n');
            }
            await del_1.default(sosPluginExtractPath, { force: true, expandDirectories: true });
            await del_1.default(sosPluginExtractPath, { force: true });
            return res.json({ success: true });
        }
        catch (e) {
            return res.json({
                success: false,
                message: 'Failed to install the SOS plugin files',
                error: e
            });
        }
    });
    unzipper.on('error', (e) => {
        return res.json({
            success: false,
            message: 'Failed to unzip the SOS plugin archive',
            error: e
        });
    });
    unzipper.extract({ path: sosPluginExtractPath });
};
