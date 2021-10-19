import { useState } from 'react';
import { IContextData } from '../../../../Context';

const Section = ({ children, title, width, className }: { cxt: IContextData; children: any; title: any; width?: number, className?: string }) => {
	const [isVisible, setVisible] = useState(true);
	return (
		<div className={`cg-section ${!isVisible ? 'hide' : ''} ${className||''}`} style={{ width }}>
			<div className="cg-bar">
				<div className="title">{title}</div>
				<div className="toggle-section" onClick={() => setVisible(!isVisible)}>
					{isVisible ? 'Hide' : 'Show'}
				</div>
			</div>
			<div className="cg-content">{children}</div>
		</div>
	);
};

export default Section;
