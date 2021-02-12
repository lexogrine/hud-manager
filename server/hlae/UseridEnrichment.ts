import BufferReader from './BufferReader';

export type UserEnrichmentKeyValue = string | number | boolean | bigInt.BigInteger;

export interface UserEnrichment {
	value: UserEnrichmentKeyValue;
	xuid: string;
}

export const unserializeEnrichment = (bufferReader: BufferReader, keyValue: UserEnrichmentKeyValue): UserEnrichment => {
	const xuid = bufferReader.readBigUInt64LE().toString();
	return {
		value: keyValue,
		xuid: xuid
	};
};
