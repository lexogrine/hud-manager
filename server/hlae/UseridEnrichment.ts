import BufferReader from './BufferReader';

export const unserializeUseridEnrichment = (bufferReader: BufferReader, keyValue: any) => {
	const xuid = bufferReader.readBigUInt64LE().toString();

	return {
		value: keyValue,
		xuid: xuid
	};
};
