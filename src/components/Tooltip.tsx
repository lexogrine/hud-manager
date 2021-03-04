import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';

interface Props {
	id: string;
	className?: string;
	label: any;
	link?: string;
	children?: any
}

const Tip = ({id, className, label, link,children}: Props) => {
	const [ isOpen, setOpen ] = useState(false);

	const toggle = () => setOpen(!isOpen);

	return (
		<>
			<span className={className || ''} id={id} onMouseOver={toggle}>
				{link ? (
					<a
						style={{ textDecoration: 'none', color: 'white' }}
						rel="noopener noreferrer"
						href={link}
						target="_blank"
					>
						{label}
					</a>
				) : (
					label
				)}
			</span>
			<Tooltip placement="top" target={id} isOpen={isOpen} toggle={toggle}>
				{children}
			</Tooltip>
		</>
	);
}
export default Tip;