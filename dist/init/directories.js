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
exports.checkDirectories = exports.loadHUDPremium = exports.loadAllPremiumHUDs = exports.LHMP = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const database_1 = require("./database");
//import { verifyAdvancedFXInstallation } from '../server/hlae/integration';
const DecompressZip = require('decompress-zip');
const temporaryFilesArchive = path.join(electron_1.app.getPath('userData'), 'archives');
exports.LHMP = {
    csgo: '1.3.0',
    rocketleague: '1.1.2',
    dota2: null,
    f1: null
};
function createIfMissing(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}
const getRandomString = () => (Math.random() * 1000 + 1)
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 15);
const removeArchives = () => {
    const files = fs
        .readdirSync(temporaryFilesArchive)
        .filter(file => (file.startsWith('hud_temp_') || file.startsWith('ar_temp_')) && file.endsWith('.zip'));
    files.forEach(file => {
        try {
            if (fs.lstatSync(path.join(temporaryFilesArchive, file)).isDirectory()) {
                return;
            }
            if (fs.existsSync(path.join(temporaryFilesArchive, file)))
                fs.unlinkSync(path.join(temporaryFilesArchive, file));
        }
        catch { }
    });
};
const remove = (pathToRemove, leaveRoot = false) => {
    if (!fs.existsSync(pathToRemove)) {
        return;
    }
    const files = fs.readdirSync(pathToRemove);
    files.forEach(function (file) {
        const current = path.join(pathToRemove, file);
        if (fs.lstatSync(current).isDirectory()) {
            // recurse
            remove(current);
            if (fs.existsSync(current))
                fs.rmdirSync(current);
        }
        else {
            // delete file
            if (fs.existsSync(current))
                fs.unlinkSync(current);
        }
    });
    if (!leaveRoot)
        fs.rmdirSync(pathToRemove);
};
const loadAllPremiumHUDs = () => {
    return Promise.all([
        loadHUDPremium('csgo', 'csgo'),
        loadHUDPremium('rocketleague', 'rocketleague1'),
        loadHUDPremium('rocketleague', 'rocketleague2')
    ]);
};
exports.loadAllPremiumHUDs = loadAllPremiumHUDs;
async function loadHUDPremium(game, dir) {
    removeArchives();
    return new Promise(res => {
        const hudPath = path.join(electron_1.app.getPath('userData'), 'premium', dir);
        const hudVersion = exports.LHMP[game];
        if (!fs.existsSync(hudPath) || !hudVersion) {
            return res(null);
        }
        const versionFile = path.join(hudPath, 'version');
        const doVersionFileExist = fs.existsSync(versionFile);
        let shouldUpdate = false;
        if (!doVersionFileExist) {
            shouldUpdate = true;
        }
        else {
            const content = fs.readFileSync(versionFile, 'utf-8');
            if (hudVersion && hudVersion !== content) {
                shouldUpdate = true;
            }
        }
        if (!shouldUpdate) {
            return res(null);
        }
        remove(hudPath, true);
        fs.writeFileSync(versionFile, hudVersion);
        let archiveFilename = './lhmp';
        if (game !== 'csgo') {
            archiveFilename += dir;
        }
        archiveFilename += '.zip';
        try {
            /*const fileBuffer = fs.readFileSync(path.join(__dirname, archiveFilename));

            if (!fileBuffer) {
                res(null);
                throw new Error();
            }

            const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
            const archiveFilepath = path.join(temporaryFilesArchive, tempArchiveName);
            //const tempArchivePath = path.join(app.getPath('userData'), tempArchiveName);
            fs.writeFileSync(archiveFilepath, fileBuffer, { mode: 777 });*/
            const tempUnzipper = new DecompressZip(path.join(__dirname, archiveFilename));
            tempUnzipper.on('extract', async () => {
                removeArchives();
                res(null);
            });
            tempUnzipper.on('error', (err) => {
                console.log(err);
                if (fs.existsSync(hudPath)) {
                    remove(hudPath, true);
                }
                removeArchives();
                res(null);
            });
            tempUnzipper.extract({
                path: hudPath
            });
            /**/
        }
        catch (e) {
            console.log(e);
            if (fs.existsSync(hudPath)) {
                remove(hudPath, true);
            }
            removeArchives();
            res(null);
        }
    });
}
exports.loadHUDPremium = loadHUDPremium;
function checkDirectories() {
    const hudsData = path.join(electron_1.app.getPath('home'), 'HUDs');
    const userData = electron_1.app.getPath('userData');
    const premiumHUDsDirectory = path.join(electron_1.app.getPath('userData'), 'premium');
    const premiumHUDsGames = ['csgo/', 'rocketleague1/', 'rocketleague2/'].map(dir => path.join(premiumHUDsDirectory, dir));
    const database = path.join(userData, 'databases');
    const arData = path.join(userData, 'ARs');
    const errors = path.join(userData, 'errors');
    const hlaeDirectory = path.join(userData, 'hlae');
    const afxDirectory = path.join(userData, 'afx');
    const userDatabases = path.join(database, 'users');
    const teamDatabases = path.join(database, 'workspaces');
    [
        hudsData,
        userData,
        database,
        hlaeDirectory,
        afxDirectory,
        arData,
        errors,
        temporaryFilesArchive,
        userDatabases,
        teamDatabases,
        premiumHUDsDirectory,
        ...premiumHUDsGames
    ].forEach(createIfMissing);
    const mapFile = path.join(electron_1.app.getPath('userData'), 'maps.json');
    if (!fs.existsSync(mapFile)) {
        const maps = [
            'de_mirage',
            'de_dust2',
            'de_inferno',
            'de_nuke',
            'de_train',
            'de_overpass',
            'de_vertigo',
            'de_cache',
            'de_ancient'
        ];
        fs.writeFileSync(mapFile, JSON.stringify(maps));
    }
    (0, database_1.loadSessionStore)();
    //verifyAdvancedFXInstallation()
}
exports.checkDirectories = checkDirectories;
