import React, { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import api from '../../api/api';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';

const Content = () => {
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
		</div>
	);
};

export default Content;
