import { CSGO } from 'csgogsi-socket';

export type AvailableGames = 'csgo' | 'rocketleague' | 'dota2' | 'f1';

export type AvailableResources = 'teams' | 'players' | 'customs' | 'mapconfigs' | 'matches' | 'tournaments';

export interface Item {
	id: string;
	text: string;
	active: boolean;
}

export interface CameraRoomPlayer {
	steamid: string;
	label: string;
	allow: boolean;
	active: boolean;
}

export const availableResources: AvailableResources[] = [
	'teams',
	'players',
	'customs',
	'mapconfigs',
	'matches',
	'tournaments'
	//'arg'
];

export const availableGames: AvailableGames[] = ['csgo', 'rocketleague', 'dota2', 'f1'];

export type ResourcesTypes = Player | Team | CustomFieldStore;

export type CachedResponse = {
	resources: ResourcesTypes[];
	existing: string[];
};

export interface MapAreaConfig {
	name: string;
	polygonCorners: number[][];
	configs: string[];
	priority: number;
}

export interface MapConfig {
	map: string;
	areas: MapAreaConfig[];
}
export interface MapConfigID extends MapConfig {
	_id: string;
}

export type CloudSyncStatus = 'NO_UPLOADED_RESOURCES' | 'ALL_SYNCED' | 'NO_SYNC_LOCAL' | 'UNKNOWN_ERROR';
export interface Player {
	_id: string;
	firstName: string;
	lastName: string;
	username: string;
	avatar: string;
	country: string;
	game?: AvailableGames;
	steamid: string;
	team: string;
	extra: Record<string, string>;
}

export type CustomFieldInputType = Exclude<PanelInputType, 'select' | 'action' | 'checkbox'>;

export interface CustomFieldData {
	name: string;
	type: CustomFieldInputType;
}

export interface CustomFieldEntry extends CustomFieldData {
	_id: string;
	visible: boolean;
}

export type onExtraChangeFunction = {
	(field: string, type: 'image'): (files: FileList) => void;
	(field: string, type: 'color'): (hex: string) => void;
	(field: string, type: CustomFieldInputType): (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export interface CustomFieldStore {
	teams: CustomFieldEntry[];
	players: CustomFieldEntry[];
}

export interface CFG {
	cfg: string;
	file: string;
}

export interface Team {
	_id: string;
	name: string;
	shortName: string;
	country: string;
	game?: AvailableGames;
	logo: string;
	extra: Record<string, string>;
}

export type VetoType = 'ban' | 'pick' | 'decider';

export type VetoScore = {
	[key: string]: number;
};
export type VetoSides = 'CT' | 'T' | 'NO';
export interface CSGOVeto {
	teamId: string;
	mapName: string;
	side: VetoSides;
	type: VetoType;
	score?: VetoScore;
	rounds?: RoundData[];
	reverseSide?: boolean;
	winner?: string;
	game?: CSGO;
	mapEnd: boolean;
}

export interface Dota2Veto {
	mapEnd: boolean;
	winner?: string;
	score?: VetoScore;
	reverseSide?: boolean;
}

export interface RocketLeagueVeto {
	mapEnd: boolean;
	winner?: string;
	score?: VetoScore;
	reverseSide?: boolean;
	// map: string
}

export interface F1Veto {
	mapEnd: boolean;
	winner?: string;
	score?: VetoScore;
	reverseSide?: boolean;
	// map: string
}

export type Veto = CSGOVeto | Dota2Veto | RocketLeagueVeto | F1Veto;

export interface MatchFactory<T extends Veto, N extends AvailableGames> {
	id: string;
	current: boolean;
	left: MatchTeam;
	right: MatchTeam;
	game: N;
	matchType: BOTypes;
	vetos: T[];
	startTime: number;
}

export type Dota2Match = MatchFactory<Dota2Veto, 'dota2'>;

export type CSGOMatch = MatchFactory<CSGOVeto, 'csgo'>;

export type RocketLeagueMatch = MatchFactory<RocketLeagueVeto, 'rocketleague'>;

export type F1Match = MatchFactory<F1Veto, 'f1'>;

export type BOTypes = 'bo1' | 'bo2' | 'bo3' | 'bo5' | 'bo7' | 'bo9';

export interface MatchTeam {
	id: string | null;
	wins: number;
}

export type Match = CSGOMatch | Dota2Match | RocketLeagueMatch | F1Match;

/*
export interface Match {
	id: string;
	current: boolean;
	left: MatchTeam;
	right: MatchTeam;
	game?: AvailableGames;
	matchType: BOTypes;
	vetos: Veto[];
	startTime: number;
}*/

export interface TournamentMatchup {
	_id: string;
	loser_to: string | null; // IDs of Matchups, not Matches
	winner_to: string | null;
	label: string;
	matchId: string | null;
	stage: string | number | null;
	parents: TournamentMatchup[];
}

export interface DepthTournamentMatchup extends TournamentMatchup {
	depth: number;
	parents: DepthTournamentMatchup[];
}

export type TournamentTypes = 'swiss' | 'single' | 'double';

export type TournamentStage = {
	type: TournamentTypes;
	matchups: TournamentMatchup[];
	teams: number;
	phases: number;
	participants: string[];
};

export interface Tournament {
	_id: string;
	name: string;
	game?: string | null;
	logo: string;
	groups: TournamentStage[];
	playoffs: TournamentStage;
	autoCreate: boolean;
}

export interface LegacyTournamentMatchup {
	_id: string;
	loser_to: string | null; // IDs of Matchups, not Matches
	winner_to: string | null;
	label: string;
	matchId: string | null;
	parents: LegacyTournamentMatchup[];
}

export interface LegacyTournament {
	_id: string;
	name: string;
	logo: string;
	matchups: LegacyTournamentMatchup[];
	autoCreate: boolean;
}

export interface Config {
	port: number;
	steamApiKey: string;
	token: string;
	hlaePath: string;
	afxCEFHudInteropPath: string;
	sync: boolean;
	cg: boolean;
	autoSwitch: boolean;
	game?: AvailableGames;
}

export interface ExtendedConfig extends Config {
	ip: string;
}

export type PanelInputType =
	| 'text'
	| 'team'
	| 'image'
	| 'images'
	| 'match'
	| 'player'
	| 'select'
	| 'action'
	| 'checkbox'
	| 'color';

export interface GeneralInput {
	type: CustomFieldInputType;
	name: string;
	label: string;
}

export interface SelectActionInput {
	type: 'select' | 'action';
	name: string;
	label: string;
	values: {
		label: string;
		name: string;
	}[];
}

export interface CheckboxInput {
	type: 'checkbox';
	name: string;
	label: string;
}

export type PanelInput = GeneralInput | SelectActionInput | CheckboxInput;

export type KeyBind = {
	bind: string;
	action: string;
};

export type PanelTemplate = {
	ar?: boolean;
	label: string;
	name: string;
	inputs: PanelInput[];
};

export interface RoundData {
	round: number;
	players: {
		[steamid: string]: PlayerRoundData;
	};
	winner: 'CT' | 'T' | null;
	win_type: 'bomb' | 'elimination' | 'defuse' | 'time';
}

export interface PlayerRoundData {
	kills: number;
	killshs: number;
	damage: number;
	assists: number;
	deaths: number;
}

export type RequiredFields = {
	[type in keyof CustomFieldStore]?: {
		[key: string]: CustomFieldInputType;
	};
};

export type HUDSyncStatus = 'SYNCED' | 'REMOTE' | 'LOCAL';
export interface HUD {
	name: string;
	version: string;
	author: string;
	legacy: boolean;
	dir: string;
	radar: boolean;
	game: string;
	killfeed: boolean;
	panel?: PanelTemplate[];
	ar?: PanelTemplate;
	keybinds?: KeyBind[];
	url: string;
	allowAppsOnTop?: boolean;
	requiredFields?: RequiredFields;
	status: HUDSyncStatus;
	uuid: string;
	isDev: boolean;
	publicKey?: string | null;
}

export interface ARModule {
	name: string;
	version: string;
	author: string;
	dir: string;
	entry: string;
	game: AvailableGames;
	keybinds: KeyBind[];
	panel?: PanelTemplate;
}

export interface User {
	id: number;
	email: string;
	password: string;
	admin: boolean;
	banned: boolean;
	username: string;
	token: string;
	license: License;
}

export type LicenseType = 'free' | 'professional' | 'personal' | 'enterprise';
export interface License {
	id: number;
	type: LicenseType;
	owner: number;
	status: string;
	valid: boolean;
	validFrom: number;
	validUntil: Date;
	endTime: number;
	nextUpdate: number;
	startTime: number;
}

export interface Customer {
	user: User;
	license: License;
	iat: number;
	exp: number;
	//teams: WorkspaceTeam[];
}

export type Workspace = {
	id: number,
	name: string,
	permissions: string[]
}

export interface CustomerData {
	customer: Customer | null;
	game: AvailableGames | null;
	workspace: Workspace | null;
	workspaces: Workspace[] | null;
}

export interface CloudStorageData<T> {
	id: number;
	lhmId: string;
	data: T;
	game: AvailableGames;
	owner: number;
}

export type ResourceUpdateStatus = {
	[resource in AvailableResources]: string | null;
};

export type LastUpdated = {
	[game in AvailableGames]: ResourceUpdateStatus;
};

export type Replacer = {
	[resource in AvailableResources]: (resource: any[], game: AvailableGames, existing: string[]) => Promise<boolean>;
};

export interface ResourceResponseStatus {
	resource: AvailableResources;
	status: string | null;
}

export interface LastLaunchedVersion {
	version: string;
	releaseDate: string;
}
