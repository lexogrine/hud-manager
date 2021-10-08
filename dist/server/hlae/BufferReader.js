"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_integer_1 = __importDefault(require("big-integer"));
function findDelim(buffer, idx) {
    let delim = -1;
    for (let i = idx; i < buffer.length; ++i) {
        if (0 == buffer[i]) {
            delim = i;
            break;
        }
    }
    return delim;
}
class BufferReader {
    buffer;
    index;
    constructor(buffer) {
        this.buffer = buffer;
        this.index = 0;
    }
    readBigUInt64LE = () => {
        const lo = this.readUInt32LE();
        const hi = this.readUInt32LE();
        return (0, big_integer_1.default)(lo).or((0, big_integer_1.default)(hi).shiftLeft(32));
    };
    readUInt32LE = () => {
        const result = this.buffer.readUInt32LE(this.index);
        this.index += 4;
        return result;
    };
    readInt32LE = () => {
        const result = this.buffer.readInt32LE(this.index);
        this.index += 4;
        return result;
    };
    readInt16LE = () => {
        const result = this.buffer.readInt16LE(this.index);
        this.index += 2;
        return result;
    };
    readInt8 = () => {
        const result = this.buffer.readInt8(this.index);
        this.index += 1;
        return result;
    };
    readUInt8 = () => {
        const result = this.buffer.readUInt8(this.index);
        this.index += 1;
        return result;
    };
    readBoolean = () => {
        return 0 != this.readUInt8();
    };
    readFloatLE = () => {
        const result = this.buffer.readFloatLE(this.index);
        this.index += 4;
        return result;
    };
    readCString = () => {
        const delim = findDelim(this.buffer, this.index);
        if (this.index <= delim) {
            const result = this.buffer.toString('utf8', this.index, delim);
            this.index = delim + 1;
            return result;
        }
        throw new Error('BufferReader.prototype.readCString');
    };
    eof = () => {
        return this.index >= this.buffer.length;
    };
}
exports.default = BufferReader;
