"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maps = void 0;
const de_mirage_1 = __importDefault(require("./de_mirage"));
const de_cache_1 = __importDefault(require("./de_cache"));
const de_dust2_1 = __importDefault(require("./de_dust2"));
const de_inferno_1 = __importDefault(require("./de_inferno"));
const de_train_1 = __importDefault(require("./de_train"));
const de_overpass_1 = __importDefault(require("./de_overpass"));
const de_nuke_1 = __importDefault(require("./de_nuke"));
const de_vertigo_1 = __importDefault(require("./de_vertigo"));
const de_ancient_1 = __importDefault(require("./de_ancient"));
const maps = {
    de_mirage: de_mirage_1.default,
    de_cache: de_cache_1.default,
    de_inferno: de_inferno_1.default,
    de_dust2: de_dust2_1.default,
    de_train: de_train_1.default,
    de_overpass: de_overpass_1.default,
    de_nuke: de_nuke_1.default,
    de_vertigo: de_vertigo_1.default,
    de_ancient: de_ancient_1.default
};
exports.maps = maps;
