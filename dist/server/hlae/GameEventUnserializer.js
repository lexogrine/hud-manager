"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameEventDescription_1 = __importDefault(require("./GameEventDescription"));
class GameEventUnserializer {
    enrichments;
    knownEvents;
    constructor(enrichments) {
        this.enrichments = enrichments;
        this.knownEvents = {}; // id -> description
    }
    unserialize = (bufferReader) => {
        const eventId = bufferReader.readInt32LE();
        if (eventId === 0) {
            const gameEvent = new GameEventDescription_1.default(bufferReader);
            this.knownEvents[gameEvent.eventId] = gameEvent;
            if (this.enrichments[gameEvent.eventName]) {
                gameEvent.enrichments = this.enrichments[gameEvent.eventName];
            }
            if (undefined === gameEvent)
                throw new Error('GameEventUnserializer.prototype.unserialize');
            const result = gameEvent.unserialize(bufferReader);
            return result;
        }
        const gameEvent = this.knownEvents[eventId];
        if (undefined === gameEvent)
            throw new Error('GameEventUnserializer.prototype.unserialize');
        const result = gameEvent.unserialize(bufferReader);
        return result;
    };
}
exports.default = GameEventUnserializer;
