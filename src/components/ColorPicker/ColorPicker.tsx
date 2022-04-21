import { useState } from 'react';
import { Button } from 'reactstrap';
import { ColorResult, SketchPicker } from 'react-color';
const color = require('react-color/lib/helpers/color');

//const Tenteges = ColorWrap(Block);
/*
type ColorResponse = {
	hex: string; source: string, rgb: { r: number, g: number, b: number }
}
*/
interface Props {
	hex: string;
	setHex: (hex: string) => void;
	elegant?: boolean
}

const ColorPicker = ({ hex, setHex, elegant }: Props) => {
	const [displayColorPicker, setDisplayPicker] = useState(false);

	const handleChange = (data: ColorResult) => {
		setHex(data.hex);
	};

	const handleClick = () => {
		setDisplayPicker(!displayColorPicker);
	};

	const handleClose = () => {
		setDisplayPicker(false);
	};

	if (elegant) {
		return <div>
			<div className="elegant-color-picker-container" onClick={handleClick}>
				<div className="color-preview" style={{ backgroundColor: hex }} />
				<div className="color-hex">
					{hex}
				</div>
			</div>
			{displayColorPicker ? (
				<div className="pop-over">
					<SketchPicker color={hex} onChange={handleChange} disableAlpha={true} />
					{/*<Tenteges onChange={handleChange} color={hex} />*/}
				</div>
			) : null}
			{displayColorPicker ? <div className="cover" onClick={handleClose} /> : null}
		</div>
	}

	return (
		<div className="color-picker-container">
			<Button
				className="purple-btn round-btn editable"
				onClick={handleClick}
				style={{
					backgroundColor: `${hex}`,
					color: color.getContrastingColor(hex)
				}}
			>
				Set color
			</Button>
			{displayColorPicker ? (
				<div className="pop-over">
					<SketchPicker color={hex} onChange={handleChange} disableAlpha={true} />
					{/*<Tenteges onChange={handleChange} color={hex} />*/}
				</div>
			) : null}
			{displayColorPicker ? <div className="cover" onClick={handleClose} /> : null}
		</div>
	);
};

export default ColorPicker;
