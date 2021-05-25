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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDirectories = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
function createIfMissing(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}
function checkDirectories() {
    const hudsData = path.join(electron_1.app.getPath('home'), 'HUDs');
    const userData = electron_1.app.getPath('userData');
    const database = path.join(userData, 'databases');
    [hudsData, userData, database].forEach(createIfMissing);
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
