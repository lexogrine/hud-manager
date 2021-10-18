import { useState } from 'react';

const Checkbox = ({
	checked,
	onChange,
	semiChecked
}: {
	checked?: boolean;
	onChange?: () => void;
	semiChecked?: boolean;
}) => {
	const [innerState, setInnerState] = useState(false);

	const state = checked === undefined ? innerState : checked;

	const onClick = () => {
		if (onChange) {
			onChange();
		} else {
			setInnerState(!state);
		}
	};

	return (
		<div
			className={`delete-checkbox ${state ? 'active' : ''} ${semiChecked ? 'semi-active' : ''}`}
			onClick={onClick}
		>
			{state && !semiChecked ? '✓' : null}
		</div>
	);
};

export default Checkbox;
