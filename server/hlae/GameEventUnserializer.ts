import BufferReader from './BufferReader';
import GameEventDescription from './GameEventDescription';

export interface EnrichmentObject {
	[x: string]: string[];
}
class GameEventUnserializer {
	enrichments: EnrichmentObject;
	knownEvents: { [x: number]: GameEventDescription };
	constructor(enrichments: EnrichmentObject) {
		this.enrichments = enrichments;

		this.knownEvents = {}; // id -> description
	}
	unserialize = (bufferReader: BufferReader) => {
		const eventId = bufferReader.readInt32LE();

		if (eventId === 0) {
			const gameEvent = new GameEventDescription(bufferReader);

			this.knownEvents[gameEvent.eventId] = gameEvent;

			if (this.enrichments[gameEvent.eventName]) {
				gameEvent.enrichments = this.enrichments[gameEvent.eventName];
			}

			if (undefined === gameEvent) throw new Error('GameEventUnserializer.prototype.unserialize');

			const result = gameEvent.unserialize(bufferReader);
			return result;
		}
		const gameEvent = this.knownEvents[eventId];

		if (undefined === gameEvent) throw new Error('GameEventUnserializer.prototype.unserialize');

		const result = gameEvent.unserialize(bufferReader);
		return result;
	};
}

export default GameEventUnserializer;
