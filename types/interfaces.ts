import { CSGO } from 'csgogsi-socket';

export type AvailableGames = 'csgo' | 'rocketleague' | 'dota2';

export type AvailableResources = 'teams' | 'players' | 'customs' | 'mapconfigs' /* | 'matches'*/;

export const availableResources: AvailableResources[] = ['teams', 'players', 'customs', 'mapconfigs' /*, 'matches'*/];

export const availableGames: AvailableGames[] = ['csgo', 'rocketleague', 'dota2'];

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

export interface CSGOVeto {
	teamId: string;
	mapName: string;
	side: 'CT' | 'T' | 'NO';
	type: VetoType;
	score?: {
		[key: string]: number;
	};
	rounds?: RoundData[];
	reverseSide?: boolean;
	winner?: string;
	game?: CSGO;
	mapEnd: boolean;
}

export interface Dota2Veto {
	mapEnd: boolean;
	winner?: string;
	score?: {
		[key: string]: number;
	};
	reverseSide?: boolean;
}

export interface RocketLeagueVeto {
	mapEnd: boolean;
	winner?: string;
	score?: {
		[key: string]: number;
	};
	reverseSide?: boolean;
	// map: string
}

export type Veto = CSGOVeto | Dota2Veto | RocketLeagueVeto;

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

export type BOTypes = 'bo1' | 'bo2' | 'bo3' | 'bo5' | 'bo7' | 'bo9';

export interface MatchTeam {
	id: string | null;
	wins: number;
}

export type Match = CSGOMatch | Dota2Match | RocketLeagueMatch;

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
	parents: TournamentMatchup[];
}

export interface DepthTournamentMatchup extends TournamentMatchup {
	depth: number;
	parents: DepthTournamentMatchup[];
}

export interface Tournament {
	_id: string;
	name: string;
	logo: string;
	matchups: TournamentMatchup[];
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
}

export type LicenseType = 'free' | 'professional' | 'personal' | 'enterprise';
export interface License {
	id: number;
	type: LicenseType;
	validUntil: Date;
	owner: number;
}

export interface Customer {
	user: User;
	license: License;
	iat: number;
	exp: number;
}
export interface CustomerData {
	customer: Customer | null;
	game: AvailableGames | null;
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
