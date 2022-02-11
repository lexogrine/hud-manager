"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.checkDirectories = exports.loadHUDPremium = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const DecompressZip = require('decompress-zip');
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
        .readdirSync('./')
        .filter(file => (file.startsWith('hud_temp_') || file.startsWith('ar_temp_')) && file.endsWith('.zip'));
    files.forEach(file => {
        try {
            if (fs.lstatSync(file).isDirectory()) {
                return;
            }
            if (fs.existsSync(file))
                fs.unlinkSync(file);
        }
        catch { }
    });
};
const remove = (pathToRemove) => {
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
    fs.rmdirSync(pathToRemove);
};
async function loadHUDPremium() {
    removeArchives();
    return new Promise(res => {
        let hudPath = path.join(electron_1.app.getPath('userData'), 'premium', 'csgo');
        if (!fs.existsSync(hudPath)) {
            return res(null);
        }
        try {
            const fileString = fs.readFileSync(path.join(__dirname, './lhmp.zip'), 'base64');
            if (!fileString) {
                res(null);
                throw new Error();
            }
            const tempArchiveName = `./hud_temp_archive_${getRandomString()}.zip`;
            fs.writeFileSync(tempArchiveName, fileString, { encoding: 'base64', mode: 777 });
            const tempUnzipper = new DecompressZip(tempArchiveName);
            tempUnzipper.on('extract', async () => {
                removeArchives();
                res(null);
            });
            tempUnzipper.on('error', () => {
                if (fs.existsSync(hudPath)) {
                    remove(hudPath);
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
                remove(hudPath);
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
    const userDataPr = path.join(electron_1.app.getPath('userData'), 'premium');
    const userDataPrCSGO = path.join(electron_1.app.getPath('userData'), 'premium', 'csgo');
    const database = path.join(userData, 'databases');
    const arData = path.join(userData, 'ARs');
    const errors = path.join(userData, 'errors');
    const userDatabases = path.join(database, 'users');
    const teamDatabases = path.join(database, 'workspaces');
    [hudsData, userData, database, arData, errors, userDatabases, teamDatabases, userDataPr, userDataPrCSGO].forEach(createIfMissing);
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
}
exports.checkDirectories = checkDirectories;
