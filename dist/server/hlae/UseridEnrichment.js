"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unserializeEnrichment = void 0;
const unserializeEnrichment = (bufferReader, keyValue) => {
    const xuid = bufferReader.readBigUInt64LE().toString();
    return {
        value: keyValue,
        xuid: xuid
    };
};
exports.unserializeEnrichment = unserializeEnrichment;
