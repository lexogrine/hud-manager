import { Buffer } from 'buffer';
import fs from 'fs';

export type PointCoordinates = [number, number, number, number];

type PointInfo = {
	address: PointCoordinates;
	value: PointCoordinates;
	weight: number;
};
const RESOLUTIONS = {
	RED: 8,
	GREEN: 8,
	BLUE: 8,
	ALPHA: 4
};

const RESOLUTION_EIGHT = [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1];
const RESOLUTION_FOUR = [0, 1 / 3, 2 / 3, 1];

const INDEXES = {
	RED: RESOLUTION_EIGHT,
	GREEN: RESOLUTION_EIGHT,
	BLUE: RESOLUTION_EIGHT,
	ALPHA: RESOLUTION_FOUR
};

const getDistanceSquared = (pointA: PointCoordinates, pointB: PointCoordinates, weight = 1) => {
	const deltaR = pointA[0] - pointB[0];
	const deltaG = pointA[1] - pointB[1];
	const deltaB = pointA[2] - pointB[2];
	const deltaA = pointA[3] - pointB[3];

	const sum = deltaR ** 2 + deltaG ** 2 + deltaB ** 2 + deltaA ** 2;

	return sum / weight;
};

const COLORS: PointInfo[] = [
	{
		address: [224, 175, 86, 0],
		value: [255, 0, 0, 0],
		weight: 2
	},
	{
		address: [224, 175, 86, 255],
		value: [255, 0, 0, 255],
		weight: 2
	},
	{
		address: [144, 155, 221, 0],
		value: [0, 0, 255, 0],
		weight: 2
	},
	{
		address: [144, 155, 221, 255],
		value: [0, 0, 255, 255],
		weight: 2
	},
	{
		address: [169, 165, 154, 0],
		value: [168, 168, 168, 0],
		weight: 1
	},
	{
		address: [169, 165, 154, 255],
		value: [168, 168, 168, 255],
		weight: 1
	},
	{
		address: [230, 128, 0, 0],
		value: [255, 0, 0, 0],
		weight: 2
	},
	{
		address: [230, 128, 0, 255],
		value: [255, 0, 0, 255],
		weight: 2
	},
	{
		address: [0, 120, 240, 0],
		value: [0, 0, 255, 0],
		weight: 2
	},
	{
		address: [0, 120, 240, 255],
		value: [0, 0, 255, 255],
		weight: 2
	},
	{
		address: [115, 124, 120, 0],
		value: [120, 120, 120, 0],
		weight: 1
	},
	{
		address: [115, 124, 120, 255],
		value: [120, 120, 120, 255],
		weight: 1
	},
	{
		address: [0, 0, 0, 0],
		value: [0, 0, 0, 0],
		weight: 1
	},
	{
		address: [0, 0, 0, 255],
		value: [0, 0, 0, 255],
		weight: 1
	},
	{
		address: [0, 0, 255, 0],
		value: [0, 0, 255, 0],
		weight: 1
	},
	{
		address: [0, 0, 255, 255],
		value: [0, 0, 255, 255],
		weight: 1
	},
	{
		address: [0, 255, 0, 0],
		value: [0, 255, 0, 0],
		weight: 1
	},
	{
		address: [0, 255, 0, 255],
		value: [0, 255, 0, 255],
		weight: 1
	},
	{
		address: [0, 255, 255, 0],
		value: [0, 255, 255, 0],
		weight: 1
	},
	{
		address: [0, 255, 255, 255],
		value: [0, 255, 255, 255],
		weight: 1
	},
	{
		address: [255, 0, 0, 0],
		value: [255, 0, 0, 0],
		weight: 1
	},
	{
		address: [255, 0, 0, 255],
		value: [255, 0, 0, 255],
		weight: 1
	},
	{
		address: [255, 0, 255, 0],
		value: [255, 0, 255, 0],
		weight: 1
	},
	{
		address: [255, 0, 255, 255],
		value: [255, 0, 255, 255],
		weight: 1
	},
	{
		address: [255, 255, 0, 0],
		value: [255, 255, 0, 0],
		weight: 1
	},
	{
		address: [255, 255, 0, 255],
		value: [255, 255, 0, 255],
		weight: 1
	},
	{
		address: [255, 255, 255, 0],
		value: [255, 255, 255, 0],
		weight: 1
	},
	{
		address: [255, 255, 255, 255],
		value: [255, 255, 255, 255],
		weight: 1
	}
];

const iterate = (r: number, g: number, b: number, a: number) => {
	const currentColorAddress: PointCoordinates = [r * 255, g * 255, b * 255, a * 255];
	const output = [0, 0, 0, 0];

	let amountOfColors = 0;

	for (const iR of INDEXES.RED) {
		for (const iG of INDEXES.GREEN) {
			for (const iB of INDEXES.BLUE) {
				for (const iA of INDEXES.ALPHA) {
					const currentReferenceAddress: PointCoordinates = [iR * 255, iG * 255, iB * 255, iA * 255];

					let bestColor;
					let bestColorDistance = 0;

					for (const color of COLORS) {
						const distance = getDistanceSquared(color.address, currentReferenceAddress, color.weight || 1);
						if (!bestColor || distance < bestColorDistance) {
							bestColor = color;
							bestColorDistance = distance;
						}
					}

					const distance = getDistanceSquared(currentColorAddress, currentReferenceAddress, 1);

					if (bestColor && distance <= bestColorDistance) {
						output[0] += bestColor.value[0];
						output[1] += bestColor.value[1];
						output[2] += bestColor.value[2];
						output[3] += bestColor.value[3];
						amountOfColors++;
					}
				}
			}
		}
	}

	if (amountOfColors) {
		output[0] /= amountOfColors;
		output[1] /= amountOfColors;
		output[2] /= amountOfColors;
		output[3] /= amountOfColors;
	}

	return output;
};

export const generateAfxLutFile = (outputFile: string, ctXray: number[], tXray: number[]) => {
	const ctXrayTransparent = [...ctXray, 0] as PointCoordinates;
	const ctXrayVisible = [...ctXray, 255] as PointCoordinates;

	const tXrayTransparent = [...tXray, 0] as PointCoordinates;
	const tXrayVisible = [...tXray, 255] as PointCoordinates;

	COLORS[0].value = tXrayTransparent;
	COLORS[1].value = tXrayVisible;

	COLORS[6].value = tXrayTransparent;
	COLORS[7].value = tXrayVisible;

	COLORS[2].value = ctXrayTransparent;
	COLORS[3].value = ctXrayVisible;

	COLORS[8].value = ctXrayTransparent;
	COLORS[9].value = ctXrayVisible;
	const addToBuffer = (buf: Buffer) => {
		bufferContext.buffer = Buffer.concat([bufferContext.buffer, buf]);
	};

	const bufferContext = {
		buffer: Buffer.alloc(11),
		writeInt32LE: (value: number, offset?: number) => {
			const temporaryBuffer = Buffer.alloc(4);
			temporaryBuffer.writeInt32LE(value, offset);

			addToBuffer(temporaryBuffer);
		},
		writeUInt32LE: (value: number, offset?: number) => {
			const temporaryBuffer = Buffer.alloc(4);
			temporaryBuffer.writeUInt32LE(value, offset);

			addToBuffer(temporaryBuffer);
		},
		writeUInt8: (value: number, offset?: number) => {
			const temporaryBuffer = Buffer.alloc(1);
			temporaryBuffer.writeUInt8(value, offset);

			addToBuffer(temporaryBuffer);
		}
	};

	bufferContext.buffer.write('AfxRgbaLut\0');
	bufferContext.writeInt32LE(1);
	bufferContext.writeUInt32LE(RESOLUTIONS.RED);
	bufferContext.writeUInt32LE(RESOLUTIONS.GREEN);
	bufferContext.writeUInt32LE(RESOLUTIONS.BLUE);
	bufferContext.writeUInt32LE(RESOLUTIONS.ALPHA);

	for (const r of INDEXES.RED) {
		for (const g of INDEXES.GREEN) {
			for (const b of INDEXES.BLUE) {
				for (const a of INDEXES.ALPHA) {
					const currentColorAddress: PointCoordinates = [r * 255, g * 255, b * 255, a * 255];

					let bestColor;
					let bestColorDistance = 0;

					for (const color of COLORS) {
						const distance = getDistanceSquared(color.address, currentColorAddress, color.weight || 1);
						if (!bestColor || distance < bestColorDistance) {
							bestColor = color;
							bestColorDistance = distance;
						}
					}

					const value = iterate(r, g, b, a);

					// RED:
					bufferContext.writeUInt8(value[0]);
					// GREEN:
					bufferContext.writeUInt8(value[1]);
					// BLUE:
					bufferContext.writeUInt8(value[2]);
					// ALPHA:
					bufferContext.writeUInt8(value[3]);
				}
			}
		}
	}

	fs.writeFileSync(outputFile, bufferContext.buffer);
};
