
import './switch.css';

interface IProps {
	id: string;
	isOn: boolean;
	disabled?: boolean;
	handleToggle?: (e?: any) => void;
}

const Switch = ({ id, isOn, handleToggle, disabled }: IProps) => {
	const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
		if (!disabled && handleToggle) {
			handleToggle(ev);
		}
	};
	return (
		<>
			<input checked={isOn} onChange={onChange} className="react-switch-checkbox" id={id} type="checkbox" />
			<label
				style={{ background: (disabled && '#120133') || (isOn && '#6b1cff') || 'black' }}
				className="react-switch-label"
				htmlFor={id}
			>
				<span className={`react-switch-button`} />
			</label>
		</>
	);
};

export default Switch;
