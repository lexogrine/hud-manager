import BufferReader from './BufferReader';
import { unserializeEnrichment, UserEnrichment, UserEnrichmentKeyValue } from './UseridEnrichment';

interface GameEventKeys {
	name: string;
	type: number;
}

export interface GameEventObject {
	name: string;
	clientTime: number;
	keys: { [x: string]: UserEnrichment | UserEnrichmentKeyValue };
}

class GameEventDescription {
	eventId: number;
	eventName: string;
	keys: GameEventKeys[];
	enrichments: string[] | null;
	constructor(bufferReader: BufferReader) {
		this.eventId = bufferReader.readInt32LE();
		this.eventName = bufferReader.readCString();
		this.keys = [];
		this.enrichments = null;

		while (bufferReader.readBoolean()) {
			const keyName = bufferReader.readCString();
			const keyType = bufferReader.readInt32LE();
			this.keys.push({
				name: keyName,
				type: keyType
			});
		}
	}
	unserialize = (bufferReader: BufferReader) => {
		const clientTime = bufferReader.readFloatLE();
		const result: GameEventObject = {
			name: this.eventName,
			clientTime: clientTime,
			keys: {}
		};
		for (let i = 0; i < this.keys.length; ++i) {
			const key = this.keys[i];

			const keyName = key.name;

			let keyValue: string | number | boolean | bigInt.BigInteger;

			switch (key.type) {
				case 1:
					keyValue = bufferReader.readCString();
					break;
				case 2:
					keyValue = bufferReader.readFloatLE();
					break;
				case 3:
					keyValue = bufferReader.readInt32LE();
					break;
				case 4:
					keyValue = bufferReader.readInt16LE();
					break;
				case 5:
					keyValue = bufferReader.readInt8();
					break;
				case 6:
					keyValue = bufferReader.readBoolean();
					break;
				case 7:
					keyValue = bufferReader.readBigUInt64LE();
					break;
				default:
					throw new Error('GameEventDescription.prototype.unserialize');
			}

			result.keys[key.name] = keyValue;

			if (this.enrichments && this.enrichments.includes(keyName)) {
				result.keys[key.name] = unserializeEnrichment(bufferReader, keyValue);
			}
		}
		return result;
	};
}

export default GameEventDescription;
