import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
const { ColorWrap, EditableInput, Checkboard } = require('react-color/lib/components/common');
const color = require('react-color/lib/helpers/color');

export const Block = ({ onChange, hex, width, className = '' }: any) => {
	const transparent = hex === 'transparent';
	const handleChange = (hexCode: any, e: any) => {
		color.isValidHex(hexCode) &&
			onChange(
				{
					hex: hexCode,
					source: 'hex'
				},
				e
			);
	};

	const styles = {
		card: {
			width,
			background: '#fff',
			boxShadow: '0 1px rgba(0,0,0,.1)',
			borderRadius: '6px',
			position: 'relative'
		},
		head: {
			height: '110px',
			background: hex,
			borderRadius: '6px 6px 0 0',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative'
		},
		body: {
			padding: '10px'
		},
		label: {
			fontSize: '18px',
			color: color.getContrastingColor(hex),
			position: 'relative'
		},
		triangle: {
			width: '0px',
			height: '0px',
			borderStyle: 'solid',
			borderWidth: '0 10px 10px 10px',
			borderColor: `transparent transparent ${hex} transparent`,
			position: 'absolute',
			top: '-10px',
			left: '50%',
			marginLeft: '-10px'
		},
		input: {
			width: '100%',
			fontSize: '12px',
			color: '#666',
			border: '0px',
			outline: 'none',
			height: '22px',
			boxShadow: 'inset 0 0 0 1px #ddd',
			borderRadius: '4px',
			padding: '0 7px',
			boxSizing: 'border-box'
		}
	};

	return (
		<div style={styles.card as React.CSSProperties} className={`block-picker ${className}`}>
			<div style={styles.triangle as React.CSSProperties} />

			<div style={styles.head as React.CSSProperties}>
				{transparent && <Checkboard borderRadius="6px 6px 0 0" />}
				<div style={styles.label as React.CSSProperties}>{hex}</div>
			</div>

			<div style={styles.body}>
				<EditableInput style={{ input: styles.input }} value={hex} onChange={handleChange} />
			</div>
		</div>
	);
};

Block.propTypes = {
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Block.defaultProps = {
	width: 170
};
const Tenteges = ColorWrap(Block);

interface Props {
	hex: string;
	setHex: (hex: string) => void;
}

const ColorPicker = ({ hex, setHex }: Props) => {
	const [displayColorPicker, setDisplayPicker] = useState(false);

	const handleChange = (data: { hex: string; source: string }) => {
		setHex(data.hex.toUpperCase());
	};

	const handleClick = () => {
		setDisplayPicker(!displayColorPicker);
	};

	const handleClose = () => {
		setDisplayPicker(false);
	};
	return (
		<div className="color-picker-container">
			<Button
				className="purple-btn round-btn"
				onClick={handleClick}
				style={{
					backgroundColor: hex,
					color: color.getContrastingColor(hex)
				}}
			>
				Set color
			</Button>
			{displayColorPicker ? (
				<div className="pop-over">
					<Tenteges onChange={handleChange} color={hex} />
				</div>
			) : null}
			{displayColorPicker ? <div className="cover" onClick={handleClose} /> : null}
		</div>
	);
};

export default ColorPicker;
