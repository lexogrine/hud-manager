import { useEffect, useState } from 'react';
import { Col, Input } from 'reactstrap';
import api from '../../api/api';
import Navbar from './Navbar/Navbar';
import Tabs from './Tabs/Tabs';
import { useTranslation } from 'react-i18next';
import { AvailableGames, Customer } from '../../api/interfaces';
import WindowBar from '../../WindowBar';
import goBack from './../../styles/goBack.png';
import toggleIcon from './../../styles/navbarToggle.png';
import ProfileTab from './ProfileTab';
import HUDDropArea from './HUDDropArea';

export const isCGMode = false;

type TabHandler = { handler: null | (() => void); header: string | null };

const tabTitles: Record<string, TabHandler> = {};

let timeout: NodeJS.Timeout | null = null;

const Content = ({
	active,
	available,
	toggleSync,
	clearGame,
	game,
	logout,
	version,
	loadUser,
	customer
}: {
	available: boolean;
	active: boolean;
	toggleSync: () => void;
	clearGame: () => void;
	logout: () => void;
	loadUser: () => void;
	game: AvailableGames;
	customer?: Customer;
	version: string;
}) => {
	const [show, setShow] = useState(false);
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

	const [search, setSearch] = useState('');

	const searchHandler = (event: any) => {
		setSearch(event.target.value);
	};

	const checkFiles = async () => {
		const responses = await Promise.all([api.gamestate.check(game as any), api.cfgs.check(game as any)]);
		setGSI(responses[0].success);
		setConfigs(responses[1].success);
	};

	const toggle = (tab: string, data?: any) => {
		if (activeTab !== tab) {
			setSearch('');
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

	const onDragOver = () => {
		if (activeTab !== 'huds') return;
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(() => {
			setShow(false);
		}, 100);

		if (!show) {
			setShow(true);
		}
	};

	const allow = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		//e.stopPropagation();
		onDragOver();
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

			api.huds.save(reader.result, name);
		};
	};
	const drop = (evt: React.DragEvent<HTMLDivElement>) => {
		evt.preventDefault();
		if (evt.dataTransfer?.files && evt.dataTransfer.files.length) {
			handleZIPs(evt.dataTransfer.files);
		}
	};

	const getHeaderTitle = () => {
		let title = activeTab;
		let size = null;
		if (activeTab === 'arg') {
			title = 'Auto Replay Generator';
			size = 25;
		} else if (activeTab === 'aco') {
			title = 'Auto Cinematic Observer';
			size = 25;
		} else if (activeTab === 'ar') {
			title = 'Augmented Reality';
			size = 25;
		} else if (activeTab === 'cgpanel') {
			title = 'CG Mode';
		}
		return { title, size };
	};

	useEffect(() => {
		window.ipcApi?.receive?.('switchTab', (tab: string) => {
			toggle(tab);
		});
	}, []);

	useEffect(() => {
		checkFiles();
	}, [game]);

	const { t } = useTranslation();
	const { title, size } = getHeaderTitle();
	return (
		<div className={`main-container ${isCollapsed ? 'collapsed' : ''}`} onDragOver={allow} onDrop={drop}>
			<Navbar
				activeTab={activeTab}
				toggle={toggle}
				files={gsi && configs}
				setCollapse={setCollapse}
				version={version}
				isCollapsed={isCollapsed}
			/>
			<Col style={{ display: 'flex', flexDirection: 'column' }}>
				<WindowBar />
				<div className="tab-title-container">
					<div className="header-title" style={{ fontSize: size || undefined }}>
						{onBackClick.handler ? <img src={goBack} onClick={onBackClick.handler} /> : null}{' '}
						{onBackClick.header || title}
					</div>
					{title === 'players' || title === 'teams' ? (
						<Input
							type="text"
							name="name"
							id="player_search"
							value={search}
							onChange={searchHandler}
							placeholder={t('common.search')}
						/>
					) : null}
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
							href={!available ? 'https://lexogrine.com/manager/login' : undefined}
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
					search={search}
					gsiCheck={checkFiles}
				/>
			</Col>
			{customer ? (
				<ProfileTab
					isOpen={isProfileShown}
					close={() => setShowProfile(false)}
					customer={customer}
					logout={logout}
					loadUser={loadUser}
				/>
			) : null}
			<HUDDropArea show={!!customer && show} />
		</div>
	);
};

export default Content;
