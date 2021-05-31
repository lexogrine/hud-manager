import React, { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import api from '../../api/api';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';

const Content = ({
	active,
	available,
	toggleSync,
	clearGame
}: {
	available: boolean;
	active: boolean;
	toggleSync: () => void;
	clearGame: () => void;
}) => {
	const [activeTab, setTab] = useState('huds');
	const [data, setData] = useState(null);
	const [gsi, setGSI] = useState(true);
	const [configs, setConfigs] = useState(true);

	const checkFiles = async () => {
		const responses = await Promise.all([api.gamestate.check(), api.cfgs.check()]);
		setGSI(responses[0].success);
		setConfigs(responses[1].success);
	};

	const toggle = (tab: string, data?: any) => {
		if (activeTab !== tab) {
			setTab(tab);
			setData(data);
		}
	};
	useEffect(() => {
		checkFiles();
	}, []);

	return (
		<div className="main-container">
			<Navbar activeTab={activeTab} toggle={toggle} files={gsi && configs} />
			<Col>
				<Tabs activeTab={activeTab} data={data} toggle={toggle} gsiCheck={checkFiles} />
			</Col>
			<div className="top_buttons">
				<div className={`sync_button`} onClick={clearGame}>
					CHANGE GAME
				</div>
				<a
					className={`sync_button ${active ? 'active' : ''}`}
					onClick={() => {
						if (!available) return;
						toggleSync();
					}}
					href={!available ? 'https://lexogrine.com/manager/register' : undefined}
					rel={'noopener noreferrer'}
					target={!available ? '_blank' : undefined}
				>
					{active ? 'CLOUD IS ACTIVE' : 'CLOUD IS NOT ACTIVE'}
				</a>
			</div>
		</div>
	);
};

export default Content;
