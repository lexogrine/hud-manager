import { Modal, ModalHeader, ModalBody, ModalFooter, Col, Row } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import { useState } from 'react';
import ColorPicker from '../../../ColorPicker/ColorPicker';

const hexToRgb = (hex: string) => {
	const bigint = parseInt(hex.replace('#', ''), 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return [r, g, b];
};

interface Props {
	isOpen: boolean;
	toggle: () => void;
}

const ChangeColors = ({ isOpen, toggle }: Props) => {
	const [ctHex, setCTHex] = useState<string>('#0000ff');
	const [tHex, setTHex] = useState<string>('#ff0000');
	const setXRay = () => {
		api.hlae.setXray(hexToRgb(ctHex), hexToRgb(tHex));
	};
	const { t } = useTranslation();
	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal xray">
			<ModalHeader toggle={toggle}>XRAY COLORS</ModalHeader>
			<ModalBody>
				<Row>
					<Col md="6" className="xray-picker">
						<div>Counter-Terrorists</div>
						<ColorPicker hex={ctHex} setHex={setCTHex} elegant />
					</Col>
					<Col md="6" className="xray-picker">
						<div>Terrorists</div>
						<ColorPicker hex={tHex} setHex={setTHex} elegant />
					</Col>
				</Row>
			</ModalBody>
			<ModalFooter className="no-padding">
				<div className="button green empty big wide" onClick={toggle}>
					{t('common.cancel')}
				</div>
				<div className="button green big wide" onClick={setXRay}>
					{t('common.save')}
				</div>
			</ModalFooter>
		</Modal>
	);
};
export default ChangeColors;
