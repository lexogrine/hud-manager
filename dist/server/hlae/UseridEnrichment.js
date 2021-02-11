"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unserializeUseridEnrichment = void 0;
exports.unserializeUseridEnrichment = (bufferReader, keyValue) => {
    const xuid = bufferReader.readBigUInt64LE().toString();
    return {
        value: keyValue,
        xuid: xuid
    };
};
