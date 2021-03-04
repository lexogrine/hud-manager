import React from 'react';
import './switch.css';

interface IProps {
	id: string;
	isOn: boolean;
	handleToggle?: (e?: any) => void;
}

const Switch = ({ id, isOn, handleToggle }: IProps) => (
	<>
		<input checked={isOn} onChange={handleToggle} className="react-switch-checkbox" id={id} type="checkbox" />
		<label style={{ background: (isOn && '#6b1cff') || 'black' }} className="react-switch-label" htmlFor={id}>
			<span className={`react-switch-button`} />
		</label>
	</>
);

export default Switch;
