export interface Player {
	_id?: string;
	firstName: string;
	lastName: string;
	username: string;
	avatar: string;
	country: string;
	steamid: string;
	team: string;
}

export interface CFG {
	cfg: string;
	file: string;
}

export interface Team {
	_id?: string;
	name: string;
	shortName: string;
	country: string;
	logo: string;
}

export type VetoType = 'ban' | 'pick' | 'decider';

export interface Veto {
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
	mapEnd: boolean;
}

export type BOTypes = 'bo1' | 'bo2' | 'bo3' | 'bo5';

export interface Match {
	id: string;
	current: boolean;
	left: {
		id: string | null;
		wins: number;
	};
	right: {
		id: string | null;
		wins: number;
	};
	matchType: BOTypes;
	vetos: Veto[];
}

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
}

export interface ExtendedConfig extends Config {
	ip: string;
}

export type PanelInputType =
	| 'text'
	| 'number'
	| 'team'
	| 'image'
	| 'match'
	| 'player'
	| 'select'
	| 'action'
	| 'checkbox'
	| 'color';

export interface GeneralInput {
	type: Exclude<PanelInputType, 'select' | 'action' | 'checkbox'>;
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
}

export interface HUD {
	name: string;
	version: string;
	author: string;
	legacy: boolean;
	dir: string;
	radar: boolean;
	killfeed: boolean;
	panel?: PanelTemplate[];
	keybinds?: KeyBind[];
	url: string;
	boltobserv?: {
		css?: boolean;
		maps?: boolean;
	};
	isDev: boolean;
}
export interface User {
	id: number;
	email: string;
	password: string;
	admin: boolean;
	banned: boolean;
}

export type LicenseType = 'free' | 'professional' | 'enterprise';
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
}
