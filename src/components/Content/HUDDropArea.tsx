import uploadHUDIcon from './../../styles/upload.png';

const HUDDropArea = ({ show }: { show: boolean }) => {
	return (
		<div className={`hud-drop-container ${show ? 'show' : ''}`}>
			<div className="dropArea hightlight">
				<img src={uploadHUDIcon} /> UPLOAD HUD HERE
			</div>
		</div>
	);
};

export default HUDDropArea;
