"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unserializeEnrichment = void 0;
exports.unserializeEnrichment = (bufferReader, keyValue) => {
    const xuid = bufferReader.readBigUInt64LE().toString();
    return {
        value: keyValue,
        xuid: xuid
    };
};
