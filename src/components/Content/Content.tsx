import { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import api from '../../api/api';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';
import { useTranslation } from 'react-i18next';
import { AvailableGames, Customer } from '../../api/interfaces';
import WindowBar from '../../WindowBar';
import goBack from './../../styles/goBack.png';
import toggleIcon from './../../styles/navbarToggle.png';
import ProfileTab from './ProfileTab';

export const isCGMode = false;

type TabHandler = { handler: null | (() => void); header: string | null };

const tabTitles: Record<string, TabHandler> = {};

const Content = ({
	active,
	available,
	toggleSync,
	clearGame,
	game,
	logout,
	customer
}: {
	available: boolean;
	active: boolean;
	toggleSync: () => void;
	clearGame: () => void;
	logout: () => void;
	game: AvailableGames;
	customer?: Customer;
}) => {
	const [activeTab, setTab] = useState('huds');
	const [data, setData] = useState(null);
	const [onBackClick, setOnBackClick] = useState<TabHandler>({
		handler: null,
		header: null
	});
	const [gsi, setGSI] = useState(true);
	const [configs, setConfigs] = useState(true);
	const [isCollapsed, setCollapse] = useState(false);

	const [isProfileShown, setShowProfile] = useState(false);

	const checkFiles = async () => {
		const responses = await Promise.all([api.gamestate.check(game as any), api.cfgs.check(game as any)]);
		setGSI(responses[0].success);
		setConfigs(responses[1].success);
	};

	const toggle = (tab: string, data?: any) => {
		if (activeTab !== tab) {
			setTab(tab);
			setData(data);
			setOnBackClick(tabTitles[tab] || { handler: null, header: null });
		}
	};
	const setOnBackClick2 = (onBackClick: null | (() => void), header: string | null = null) => {
		tabTitles[activeTab] = { handler: onBackClick, header };
		setOnBackClick(tabTitles[activeTab]);
	};

	const Greeting = () => {
		if (!customer) {
			return null;
		}
		return (
			<div className="greeting" onClick={() => setShowProfile(!isProfileShown)}>
				Hi, {customer.user.username}!
				<img src={toggleIcon} />
			</div>
		);
	};

	useEffect(() => {
		checkFiles();
	}, [game]);

	const { t } = useTranslation();
	return (
		<div className={`main-container ${isCollapsed ? 'collapsed' : ''}`}>
			<Navbar
				activeTab={activeTab}
				toggle={toggle}
				files={gsi && configs}
				setCollapse={setCollapse}
				isCollapsed={isCollapsed}
			/>
			<Col style={{ display: 'flex', flexDirection: 'column' }}>
				<WindowBar />
				<div className="tab-title-container">
					<div className="header-title">
						{onBackClick.handler ? <img src={goBack} onClick={onBackClick.handler} /> : null}{' '}
						{onBackClick.header || activeTab}
					</div>
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
						<Greeting />
					</div>
				</div>
				<Tabs
					setOnBackClick={setOnBackClick2}
					activeTab={activeTab}
					data={data}
					toggle={toggle}
					gsiCheck={checkFiles}
				/>
			</Col>
			{customer ? (
				<ProfileTab
					isOpen={isProfileShown}
					close={() => setShowProfile(false)}
					customer={customer}
					logout={logout}
				/>
			) : null}
		</div>
	);
};

export default Content;
