import { useState } from 'react';
import { ReactComponent as Loading } from './../../styles/icons/loading.svg';

const LoadingButton = ({
	onClick,
	children,
	...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
	const [isLoading, setLoading] = useState(false);

	const onPressHandler = async (e: any) => {
		if (isLoading) return;
		setLoading(true);
		if (onClick) {
			await onClick(e);
		}
		setLoading(false);
	};

	return (
		<div onClick={onPressHandler} {...props}>
			{isLoading ? <Loading height={15} /> : children}
		</div>
	);
};

export default LoadingButton;
