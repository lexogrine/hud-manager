import { useState } from 'react';
import { Col, Row, Button } from 'reactstrap';
import api from '../../../../api/api';
import ColorPicker from '../../../ColorPicker/ColorPicker';

const hexToRgb = (hex: string) => {
	const bigint = parseInt(hex.replace('#', ''), 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return [r, g, b];
};

const XRay = () => {
	const [ctHex, setCTHex] = useState<string>('#0000ff');
	const [tHex, setTHex] = useState<string>('#ff0000');

	const setXRay = () => {
		api.hlae.setXray(hexToRgb(ctHex), hexToRgb(tHex));
	};

	return (
		<>
			<div className="tab-content-container full-scroll">
				<Row>
					<Col md="6">
						<div>Counter-Terrorists X-Ray</div>
						<ColorPicker hex={ctHex} setHex={setCTHex} />
					</Col>
					<Col md="6">
						<div>Terrorists X-Ray</div>
						<ColorPicker hex={tHex} setHex={setTHex} />
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<Button className="lightblue-btn round-btn" onClick={setXRay}>
							Set XRay Colors
						</Button>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default XRay;
