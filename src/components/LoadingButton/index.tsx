import { useState } from 'react';
// import { ReactComponent as Loading } from './../../styles/icons/loading.svg';

const Spinner = () => {

	return (
		<div className='spinner-container'>
			<div className='spinner-dot'/>
			<div className='spinner-dot'/>
			<div className='spinner-dot'/>
		</div>
	)
}

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
			{isLoading ? <Spinner /> : children}
		</div>
	);
};

export default LoadingButton;
