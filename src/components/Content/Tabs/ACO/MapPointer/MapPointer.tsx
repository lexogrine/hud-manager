
import { ScaleConfig } from './';
import { MapAreaConfig } from '../../../../../api/interfaces';
import React, { Fragment } from 'react';

interface IProps {
	config: ScaleConfig;
	file: string;
	onPointAdd: (x: number, y: number) => void;
	areas: MapAreaConfig[];
	onClickArea: (area: MapAreaConfig) => void;
	addingNew: boolean;
}
const hashCode = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		// tslint:disable-next-line:no-bitwise
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
};
const textToRGB = (i: string) => {
	// tslint:disable-next-line:no-bitwise
	const c = (hashCode(i) & 0x00ffffff).toString(16).toUpperCase();

	return '#' + '00000'.substring(0, 6 - c.length) + c;
};
const MapPointer = ({ config, file, onPointAdd, areas, onClickArea, addingNew }: IProps) => {
	const radarToGameUnits = (x: number, y: number) => {
		const realOffsetX = x - config.origin.x;
		const realOffsetY = y - config.origin.y;

		return { x: realOffsetX / config.pxPerUX, y: realOffsetY / config.pxPerUY };
	};

	const gameUnitsToRadar = (x: number, y: number) => {
		return { x: (x * config.pxPerUX + config.origin.x) / 2, y: (y * config.pxPerUY + config.origin.y) / 2 };
	};

	const generatePolygon = (area: MapAreaConfig) => {
		const points = area.polygonCorners
			.map(point => gameUnitsToRadar(point[0], point[1]))
			.map(coord => `${coord.x}px ${coord.y}px`);
		return `polygon(${points.join(', ')})`;
	};

	const handleClick = (ev: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
		let { offsetX, offsetY } = ev.nativeEvent;
		offsetX *= 2;
		offsetY *= 2;
		const result = radarToGameUnits(offsetX, offsetY);
		onPointAdd(result.x, result.y);
	};

	return (
		<div className="aco_picker">
			{areas.map(area => (
				<Fragment key={area.name}>
					<div
						onClick={() => !addingNew && onClickArea(area)}
						className="aco_area"
						style={{ clipPath: generatePolygon(area), backgroundColor: textToRGB(area.name) }}
					/>
					{area.polygonCorners.map(corner => (
						<div
							key={`${corner[0]}${corner[1]}`}
							className="aco_dot"
							style={{
								backgroundColor: textToRGB(area.name),
								left: `${gameUnitsToRadar(corner[0], corner[1]).x - 2.5}px`,
								top: `${gameUnitsToRadar(corner[0], corner[1]).y - 2.5}px`
							}}
						/>
					))}
				</Fragment>
			))}
			<img src={file} style={{ width: '512px' }} onClick={handleClick} />
		</div>
	);
};

export default MapPointer;
