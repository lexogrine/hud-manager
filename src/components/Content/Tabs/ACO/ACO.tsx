import React, { useState, useEffect } from 'react';
import { Row, FormGroup, Input } from 'reactstrap';
import maps from './MapPointer';
import trash from './../../../../styles/trash.svg';
import MapPointer from './MapPointer/MapPointer';
import { MapAreaConfig, MapConfig } from '../../../../api/interfaces';
import api from '../../../../api/api';
import SaveAreaModal from './SaveAreaModal/SaveAreaModal';
import AddConfigModal from './AddConfigModal/AddConfigModal';
import { socket } from '../Live/Live';
import Switch from '../../../Switch/Switch';

const ACO = () => {
	const [acos, setACOs] = useState<MapConfig[]>([]);
	const [activeMap, setActiveMap] = useState<string>('de_mirage');
	const [activeConfig, setActiveConfig] = useState<MapAreaConfig | null>(null);
	const [newArea, setNewArea] = useState<number[][] | null>(null);
	const [isModalOpened, setModalOpen] = useState(false);
	const [isConfigOpened, setConfigOpen] = useState(false);

	const [directorStatus, setDirectorStatus] = useState(false);

	const [newAreaName, setNewAreaName] = useState('');
	const [newAreaPriority, setNewAreaPriority] = useState(0);

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
	}, []);

	const activeMapConfig = maps[activeMap];
	const config = 'config' in activeMapConfig ? activeMapConfig.config : activeMapConfig.configs[0].config;
	const areas = acos.find(aco => aco.map === activeMap)?.areas || [];
	return (
		<React.Fragment>
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
			<div className="tab-title-container">ACO</div>
			<div className={`tab-content-container full-scroll`}>
				<Row className="padded">
					<div style={{ width: '512px', marginRight: '25px' }}>
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
						<div className="btn-container">
							{!newArea ? (
								<button
									type="button"
									className="round-btn run-game btn btn-secondary add_aco_config"
									onClick={() => {
										setNewArea([]);
										setActiveConfig(null);
									}}
								>
									Add area
								</button>
							) : (
								<>
									<button
										type="button"
										className="round-btn run-game btn btn-secondary add_aco_config"
										onClick={addNewArea}
									>
										Save area
									</button>
									<button
										type="button"
										className="round-btn run-game btn btn-secondary add_aco_config"
										onClick={() => setNewArea(null)}
									>
										Clear area
									</button>
								</>
							)}
						</div>
					</div>
					{activeConfig ? (
						<div style={{ flex: 1, minWidth: '386px' }}>
							<div className="aco_config_title">
								AREA: {activeConfig.name} | PRIORITY: {activeConfig.priority}
							</div>
							{activeConfig.configs.map(config => (
								<div key={config} className="aco_area_config">
									<div>{config}</div>
									<img
										src={trash}
										className="action"
										alt="Delete Config"
										onClick={() => removeConfigFromArea(config)}
									/>
								</div>
							))}
							<button
								type="button"
								className="round-btn run-game btn btn-secondary add_aco_config"
								onClick={() => setConfigOpen(true)}
							>
								Add config
							</button>
							<button
								type="button"
								className="round-btn run-game btn btn-secondary add_aco_config"
								onClick={removeCurrentArea}
							>
								Remove area
							</button>
						</div>
					) : null}
				</Row>
			</div>
		</React.Fragment>
	);
};

export default ACO;
