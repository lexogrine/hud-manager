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
exports.installSosPlugin = exports.installBakkesModData = exports.runBakkesMod = exports.downloadSosPlugin = exports.downloadBakkesModData = exports.downloadBakkesMod = exports.checkStatus = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const request_1 = __importDefault(require("request"));
const del_1 = __importDefault(require("del"));
const Sentry = __importStar(require("@sentry/node"));
const child_process_1 = require("child_process");
const steam_game_path_1 = require("steam-game-path");
const DecompressZip = require('decompress-zip');
const tempDirPath = electron_1.app.getPath('temp');
const bakkesModDirPath = path_1.default.join(process.env.APPDATA || '', '/bakkesmod/bakkesmod');
const bakkesModConfigPath = path_1.default.join(bakkesModDirPath, 'cfg/plugins.cfg');
const bakkesModDownloadUrl = 'https://github.com/bakkesmodorg/BakkesModInjectorCpp/releases/latest/download/BakkesMod.exe';
const bakkesModExePath = path_1.default.join(bakkesModDirPath, 'lhm_bakkesmod.exe');
const bakkesModDataDownloadUrl = 'https://github.com/bakkesmodorg/BakkesModInjectorCpp/releases/latest/download/bakkesmod.zip';
const bakkesModDataDownloadFilePath = path_1.default.join(tempDirPath, 'lhm_bakkesmod_data.zip');
const sosPluginInternalConfigPath = path_1.default.join(bakkesModDirPath, 'cfg/config.cfg');
const sosPluginInternalConfigRegex = /SOS_state_flush_rate "\d+"/;
const sosPluginInternalConfigTarget = `SOS_state_flush_rate "15" // added by LHM`;
const sosPluginFiles = ['plugins/SOS.dll', 'plugins/settings/sos.set'];
const sosPluginConfig = 'plugin load sos';
const sosPluginDownloadAPIPath = 'https://gitlab.com/api/v4/projects/16389912/releases';
const sosPluginDownloadUrlPrefix = 'https://gitlab.com/bakkesplugins/sos/sos-plugin';
const sosPluginDownloadFilePath = path_1.default.join(tempDirPath, 'lhm_sosplugin.zip');
const sosPluginExtractPath = path_1.default.join(tempDirPath, 'lhm_sosplugin_unpack');
const rocketLeagueUrl = 'com.epicgames.launcher://apps/Sugar?action=launch&silent=true';
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
const verifyPluginConfig = () => {
    if (!fs_1.default.existsSync(sosPluginInternalConfigPath))
        return false;
    if (fs_1.default.readFileSync(sosPluginInternalConfigPath).indexOf(sosPluginInternalConfigTarget) === -1)
        return false;
    return true;
};
const checkStatus = async (req, res) => {
    const status = {
        bakkesModExeDownloaded: false,
        bakkesModDataDownloaded: false,
        bakkesModDataInstalled: false,
        sosPluginDownloaded: false,
        sosPluginInstalled: false,
        sosConfigSet: false,
        bakkesModRunning: false
    };
    if (fs_1.default.existsSync(bakkesModExePath))
        status.bakkesModExeDownloaded = true;
    if (fs_1.default.existsSync(bakkesModDataDownloadFilePath))
        status.bakkesModDataDownloaded = true;
    if (fs_1.default.existsSync(sosPluginDownloadFilePath))
        status.sosPluginDownloaded = true;
    if (fs_1.default.existsSync(bakkesModConfigPath))
        status.bakkesModDataInstalled = true;
    if (fs_1.default.existsSync(path_1.default.join(bakkesModDirPath, sosPluginFiles[0])))
        status.sosPluginInstalled = true;
    if (verifyPluginList() && verifyPluginConfig())
        status.sosConfigSet = true;
    return res.json({ success: true, status });
};
exports.checkStatus = checkStatus;
const downloadBakkesMod = async (req, res) => {
    (0, request_1.default)(bakkesModDownloadUrl)
        .on('error', () => {
        return res.json({ success: false });
    })
        .on('end', () => {
        return res.json({ success: true, path: bakkesModExePath });
    })
        .pipe(fs_1.default.createWriteStream(bakkesModExePath));
};
exports.downloadBakkesMod = downloadBakkesMod;
const downloadBakkesModData = async (req, res) => {
    (0, request_1.default)(bakkesModDataDownloadUrl)
        .on('error', () => {
        return res.json({ success: false });
    })
        .on('end', () => {
        return res.json({ success: true, path: bakkesModDataDownloadFilePath });
    })
        .pipe(fs_1.default.createWriteStream(bakkesModDataDownloadFilePath));
};
exports.downloadBakkesModData = downloadBakkesModData;
const downloadSosPlugin = async (req, res) => {
    (0, request_1.default)(sosPluginDownloadAPIPath, (error, _response, body) => {
        if (error)
            return res.json({ success: false });
        const results = JSON.parse(body);
        const partialUrl = results[0].description.match(/\/uploads\/.+?\.zip/);
        const url = sosPluginDownloadUrlPrefix + partialUrl;
        (0, request_1.default)(url)
            .on('error', () => {
            return res.json({ success: false });
        })
            .on('end', () => {
            return res.json({ success: true, path: sosPluginDownloadFilePath });
        })
            .pipe(fs_1.default.createWriteStream(sosPluginDownloadFilePath));
    });
};
exports.downloadSosPlugin = downloadSosPlugin;
const runBakkesMod = async (req, res) => {
    if (!fs_1.default.existsSync(bakkesModExePath))
        return res.json({ success: false, message: 'BakkesMod needs to be downloaded first' });
    //execFile(bakkesModExePath);
    (0, child_process_1.spawn)(bakkesModExePath, { detached: true, stdio: 'ignore' });
    // Try Steam first
    let useSteam = true;
    let gamePath = null;
    try {
        gamePath = (0, steam_game_path_1.getGamePath)(252950);
    }
    catch (e) {
        Sentry.captureException(e);
        useSteam = false;
    }
    if (!gamePath || !gamePath.steam || !gamePath.steam.path || !gamePath.game || !gamePath.game.path) {
        useSteam = false;
    }
    const exePath = gamePath?.steam?.path && path_1.default.join(gamePath.steam.path, 'Steam.exe');
    if (useSteam && gamePath && exePath) {
        // const gameExePath = path.join(gamePath.game.path, 'Binaries/Win64/RocketLeague.exe');
        const steam = (0, child_process_1.spawn)(`"${exePath}"`, ['-applaunch 252950'], { detached: true, shell: true, stdio: 'ignore' });
        steam.unref();
    }
    else {
        const startCommand = process.platform === 'win32' ? 'start' : 'xdg-open';
        (0, child_process_1.spawn)(startCommand + ' ' + rocketLeagueUrl, { detached: true, stdio: 'ignore', shell: true });
    }
};
exports.runBakkesMod = runBakkesMod;
const installBakkesModData = async (req, res) => {
    if (!fs_1.default.existsSync(bakkesModDataDownloadFilePath))
        return res.json({ success: false, message: 'BakkesMod data needs to be downloaded first' });
    fs_1.default.mkdirSync(bakkesModDirPath, { recursive: true });
    const unzipper = new DecompressZip(bakkesModDataDownloadFilePath);
    unzipper.on('extract', async () => {
        return res.json({ success: true });
    });
    unzipper.on('error', (e) => {
        return res.json({
            success: false,
            message: 'Failed to unzip the BakkesMod data archive',
            error: e
        });
    });
    unzipper.extract({ path: bakkesModDirPath });
};
exports.installBakkesModData = installBakkesModData;
const installSosPlugin = async (req, res) => {
    if (!fs_1.default.existsSync(sosPluginDownloadFilePath))
        return res.json({ success: false, message: 'SOS plugin needs to be downloaded first' });
    if (fs_1.default.existsSync(sosPluginExtractPath)) {
        await (0, del_1.default)(sosPluginExtractPath, { force: true, expandDirectories: true });
        await (0, del_1.default)(sosPluginExtractPath, { force: true });
    }
    fs_1.default.mkdirSync(sosPluginExtractPath);
    const unzipper = new DecompressZip(sosPluginDownloadFilePath);
    unzipper.on('extract', async () => {
        try {
            await Promise.all(sosPluginFiles.map(f => move(path_1.default.join(sosPluginExtractPath, f), path_1.default.join(bakkesModDirPath, f), true)));
            if (!verifyPluginList()) {
                fs_1.default.appendFileSync(bakkesModConfigPath, '\n' + sosPluginConfig + '\n');
            }
            if (!verifyPluginConfig()) {
                const config = fs_1.default.readFileSync(bakkesModConfigPath, 'utf8').toString().split('\n');
                const index = config.findIndex(c => sosPluginInternalConfigRegex.test(c));
                if (index !== -1) {
                    config[index] = sosPluginInternalConfigTarget;
                }
                else {
                    config.push(sosPluginInternalConfigTarget);
                }
                fs_1.default.writeFileSync(sosPluginInternalConfigPath, config.join('\n'));
            }
            await (0, del_1.default)(sosPluginExtractPath, { force: true, expandDirectories: true });
            await (0, del_1.default)(sosPluginExtractPath, { force: true });
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
exports.installSosPlugin = installSosPlugin;
