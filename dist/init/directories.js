"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var electron_1 = require("electron");
function createIfMissing(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}
function checkDirectories() {
    var hudsData = path.join(electron_1.app.getPath('home'), 'HUDs');
    var userData = electron_1.app.getPath('userData');
    var database = path.join(userData, 'databases');
    [hudsData, userData, database].forEach(createIfMissing);
    var cookieFile = path.join(database, "cookie");
    var mapFile = path.join(electron_1.app.getPath('userData'), 'maps.json');
    if (!fs.existsSync(cookieFile)) {
        fs.writeFileSync(cookieFile, "[]", 'utf8');
    }
    if (!fs.existsSync(mapFile)) {
        var maps = ["de_mirage", "de_dust2", "de_inferno", "de_nuke", "de_train", "de_overpass", "de_vertigo"];
        fs.writeFileSync(mapFile, JSON.stringify(maps));
    }
}
exports.checkDirectories = checkDirectories;
