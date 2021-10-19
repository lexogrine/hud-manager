import { useState, useEffect } from 'react';
import { IContextData } from './../../../../components/Context';
import * as I from './../../../../api/interfaces';
import config from './../../../../api/config';
import { Col, Row } from 'reactstrap';
import HudEntry from './ARSupportedEntry';
import ARSettings from './Settings';
import DragInput from './../../../DragFileInput';
import api from '../../../../api/api';
import { socket } from '../Live/Live';
import { useTranslation } from 'react-i18next';
import ElectronOnly from '../../../ElectronOnly';
const isElectron = config.isElectron;

interface IProps {
	cxt: IContextData;
	toggle: (tab: string, data?: any) => void;
	setOnBackClick: I.HeaderHandler;
}

const AR = ({ cxt, setOnBackClick }: IProps) => {
	const [active, setActive] = useState<I.HUD | I.ARModule | null>(null);
	const [huds, setHUDs] = useState<I.HUD[]>([]);
	const [ars, setARs] = useState<I.ARModule[]>([]);
	const [activeModules, setActiveModules] = useState<string[]>([]);

	const { t } = useTranslation();

	const loadHUDs = async () => {
		api.huds.get().then(setHUDs);
		api.ar.get().then(ars => setARs(ars || []));
	};
	useEffect(() => {
		loadHUDs();
		socket.on('reloadHUDs', loadHUDs);

		socket.on('active_modules', (activeModules: string[]) => {
			setActiveModules(activeModules);
		});
		socket.emit('get_active_modules');
	}, []);

	const setARAsActive = (ar: I.HUD | I.ARModule | null) => {
		setActive(ar);
		setOnBackClick(
			ar
				? () => {
						setARAsActive(null);
				  }
				: null
		);
	};

	const handleZIPs = (files: FileList) => {
		const file = files[0];
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const name = file.name.substr(0, file.name.lastIndexOf('.')).replace(/\W/g, '');
			if (file.name.substr(-4) === '.rar' || !name) {
				return;
			}

			api.ar.save(reader.result, name);
		};
	};

	const isAssetHUD = (hud: I.HUD | I.ARModule): hud is I.HUD => {
		return 'uuid' in hud;
	};

	if (active) {
		return (
			<>
				{/*<div className="tab-title-container">
					<img src={goBack} onClick={() => setActive(null)} className="go-back-button" alt="Go back" />
					AR
				</div>*/}
				<div className="tab-content-container full-scroll no-padding">
					<ARSettings cxt={cxt} hud={active.dir} section={isAssetHUD(active) ? active.ar : active.panel} />
				</div>
			</>
		);
	}
	return (
		<>
			{/*<div className="tab-title-container">
				<img src={goBack} onClick={() => toggle('huds')} className="go-back-button" alt="Go back" />
				AR
			</div>*/}
			<div className={`tab-content-container ${!isElectron ? 'full-scroll' : ''}`}>
				<Row className="padded">
					<Col>
						<Col s={12}>
							<DragInput
								id={`hud_zip`}
								onChange={handleZIPs}
								label={t('ar.add').toUpperCase()}
								accept=".zip"
							/>
						</Col>
						{ars.map(ar => (
							<HudEntry
								key={ar.dir}
								hud={ar}
								setActive={setARAsActive}
								active={activeModules.some(mod => mod === ar.dir)}
							/>
						))}
						{huds
							.filter(hud => hud.ar)
							.map(hud => (
								<HudEntry key={hud.dir} hud={hud} setActive={setActive} />
							))}
					</Col>
				</Row>
			</div>
			<ElectronOnly>
				<div className="action-container">
					<div className="button green strong big wide" onClick={api.huds.openDirectory}>
						{t('huds.config.openDirectory')}
					</div>
				</div>
			</ElectronOnly>
		</>
	);
};

export default AR;
