import { useState, useEffect } from 'react';
import { FormGroup, Input } from 'reactstrap';
import maps from './MapPointer';
import trash from './../../../../styles/trash.svg';
import MapPointer from './MapPointer/MapPointer';
import { MapAreaConfig, MapConfig } from '../../../../api/interfaces';
import api from '../../../../api/api';
import SaveAreaModal from './SaveAreaModal/SaveAreaModal';
import AddConfigModal from './AddConfigModal/AddConfigModal';
import { socket } from '../Live/Live';
import Switch from '../../../Switch/Switch';
import { useTranslation } from 'react-i18next';
import { IContextData } from '../../../Context';
import { canUserFromContextUseCloud } from '../../../../utils';

interface IProps {
	cxt: IContextData;
}
const ACO = ({ cxt }: IProps) => {
	const [acos, setACOs] = useState<MapConfig[]>([]);
	const [activeMap, setActiveMap] = useState<string>('de_mirage');
	const [activeConfig, setActiveConfig] = useState<MapAreaConfig | null>(null);
	const [newArea, setNewArea] = useState<number[][] | null>(null);
	const [isModalOpened, setModalOpen] = useState(false);
	const [isConfigOpened, setConfigOpen] = useState(false);

	const [directorStatus, setDirectorStatus] = useState(false);

	const [newAreaName, setNewAreaName] = useState('');
	const [newAreaPriority, setNewAreaPriority] = useState(0);

	const { t } = useTranslation();

	const loadACOs = async () => {
		const acos = await api.aco.get();
		setACOs(acos);
	};

	const onChange = (ev: any) => {
		setActiveMap(ev.target.value);
		setActiveConfig(null);
	};
	const onPointAdd = (x: number, y: number) => {
		if (!newArea) return;

		setNewArea([...newArea, [x, y]]);
	};
	const onClickArea = (area: MapAreaConfig) => {
		setActiveConfig(area);
	};

	const addNewArea = () => {
		if (!newArea || !newArea.length) return;
		setModalOpen(true);
	};

	const saveArea = () => {
		if (!newArea || !newArea.length) return;
		let currentACO = acos.find(aco => aco.map === activeMap);
		if (!currentACO) {
			currentACO = {
				map: activeMap,
				areas: []
			};
		}
		currentACO.areas.push({ name: newAreaName, polygonCorners: newArea, configs: [], priority: 0 });
		api.aco
			.set(currentACO)
			.then(loadACOs)
			.then(() => {
				setModalOpen(false);
				setNewArea(null);
				setNewAreaName('');
			});
	};

	const saveConfig = (cfg: string) => {
		if (!activeConfig) return;
		const currentACO = acos.find(aco => aco.map === activeMap);
		if (!currentACO) return;
		activeConfig.configs.push(cfg);
		api.aco
			.set(currentACO)
			.then(loadACOs)
			.then(() => setConfigOpen(false));
	};

	const removeCurrentArea = () => {
		if (!activeConfig) return;
		const currentACO = acos.find(aco => aco.map === activeMap);
		if (!currentACO) return;
		currentACO.areas = currentACO.areas.filter(area => area !== activeConfig);
		setActiveConfig(null);
		api.aco.set(currentACO).then(loadACOs);
	};

	const removeConfigFromArea = (cfg: string) => {
		if (!activeConfig) return;
		const currentACO = acos.find(aco => aco.map === activeMap);
		if (!currentACO) return;
		activeConfig.configs = activeConfig.configs.filter(config => config !== cfg);
		api.aco.set(currentACO).then(loadACOs);
	};

	useEffect(() => {
		loadACOs();
		socket.on('directorStatus', (status: boolean) => {
			setDirectorStatus(status);
		});
		socket.emit('getDirectorStatus');
		socket.on('db_update', loadACOs);
		socket.on('reload_acocs', loadACOs);
	}, []);

	const activeMapConfig = maps[activeMap];
	const config = 'config' in activeMapConfig ? activeMapConfig.config : activeMapConfig.configs[0].config;
	const areas = acos.find(aco => aco.map === activeMap)?.areas || [];

	const isAddingDisabled =
		!cxt.customer ||
		!canUserFromContextUseCloud(cxt) ||
		(cxt.customer.license.type === 'personal' && areas.length >= 4 && cxt.workspace === null);

	const addArea = () => {
		if (isAddingDisabled) return;
		setNewArea([]);
		setActiveConfig(null);
	};

	return (
		<>
			<SaveAreaModal
				isOpen={isModalOpened}
				close={() => {
					setModalOpen(false);
					setNewArea(null);
				}}
				areaName={newAreaName}
				setAreaName={setNewAreaName}
				saveArea={saveArea}
				setAreaPriority={setNewAreaPriority}
				areaPriority={newAreaPriority}
			/>
			<AddConfigModal close={() => setConfigOpen(false)} isOpen={isConfigOpened} save={saveConfig} />
			<div className={`tab-content-container aco no-padding`}>
				<div className="edit-form" style={{ maxWidth: '644px' }}>
					<div className="main-form">
						<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
							Director status:
							<Switch
								isOn={directorStatus}
								id="switch-director"
								handleToggle={() => {
									socket.emit('toggleDirector');
								}}
							/>
						</div>
						<FormGroup>
							<Input type="select" id="map_pick" name="map_pick" value={activeMap} onChange={onChange}>
								<option value="de_mirage">de_mirage</option>
								<option value="de_cache">de_cache</option>
								<option value="de_dust2">de_dust2</option>
								<option value="de_inferno">de_inferno</option>
								<option value="de_train">de_train</option>
								<option value="de_overpass">de_overpass</option>
								<option value="de_nuke">de_nuke</option>
								<option value="de_vertigo">de_vertigo</option>
								<option value="de_ancient">de_ancient</option>
							</Input>
						</FormGroup>
						<MapPointer
							config={config}
							file={activeMapConfig.file}
							onClickArea={onClickArea}
							onPointAdd={onPointAdd}
							areas={
								newArea
									? [{ name: 'newarea', polygonCorners: newArea, configs: [], priority: 0 }]
									: areas
							}
							addingNew={!!newArea}
						/>
					</div>
				</div>
				{activeConfig ? (
					<div className="edit-form area-editor" style={{ flex: 1 }}>
						{activeConfig.configs.map((config, i) => (
							<div key={config} className="aco_area_config">
								<div style={{ display: 'flex' }}>
									<div>
										Area {activeConfig.name}, #{i + 1}
									</div>
									<div>Priority {activeConfig.priority}</div>
								</div>
								<img
									src={trash}
									className="action"
									alt="Delete Config"
									onClick={() => removeConfigFromArea(config)}
								/>
							</div>
						))}
						<div className="button-container">
							<div className="button green strong big wide" onClick={() => setConfigOpen(true)}>
								Add config
							</div>
							<div className="button green strong big wide empty" onClick={removeCurrentArea}>
								Remove area
							</div>
						</div>
					</div>
				) : null}
			</div>
			<div className="action-container">
				{!newArea ? (
					<>
						<div
							className={`button green strong big wide ${isAddingDisabled ? 'disabled' : ''}`}
							onClick={addArea}
						>
							Add area
						</div>
					</>
				) : (
					<>
						<div className="button green strong big wide empty" onClick={() => setNewArea(null)}>
							{t('common.cancel')}
						</div>
						<div className="button green strong big wide" onClick={addNewArea}>
							{t('common.save')}
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default ACO;
