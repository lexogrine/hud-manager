import { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import api from '../../api/api';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';
import { useTranslation } from 'react-i18next';
import { AvailableGames } from '../../api/interfaces';
import WindowBar from '../../WindowBar';

export const isCGMode = false;

const Content = ({
	active,
	available,
	toggleSync,
	clearGame,
	game
}: {
	available: boolean;
	active: boolean;
	toggleSync: () => void;
	clearGame: () => void;
	game: AvailableGames;
}) => {
	const [activeTab, setTab] = useState('huds');
	const [data, setData] = useState(null);
	const [gsi, setGSI] = useState(true);
	const [configs, setConfigs] = useState(true);

	const checkFiles = async () => {
		const responses = await Promise.all([api.gamestate.check(game as any), api.cfgs.check(game as any)]);
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
	}, [game]);

	const { t } = useTranslation();

	return (
		<div className="main-container">
			<Navbar activeTab={activeTab} toggle={toggle} files={gsi && configs} />
			<Col style={{ display: 'flex', flexDirection: 'column' }}>
				<WindowBar />
				<div className="tab-title-container">
					{activeTab}
					<div className="top_buttons">
						<div className={`button strong`} onClick={clearGame}>
							{t('app.changeGame')}
						</div>
						<a
							className={`button strong ${active ? 'darkgreen' : 'empty'}`}
							onClick={() => {
								if (!available) return;
								toggleSync();
							}}
							href={!available ? 'https://lexogrine.com/manager/register' : undefined}
							rel={'noopener noreferrer'}
							target={!available ? '_blank' : undefined}
						>
							{active ? t('app.cloud.isActive') : t('app.cloud.isNotAcitve')}
						</a>
					</div>
				</div>
				<Tabs activeTab={activeTab} data={data} toggle={toggle} gsiCheck={checkFiles} />
			</Col>
		</div>
	);
};

export default Content;
