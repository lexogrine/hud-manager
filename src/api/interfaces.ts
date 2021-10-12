import { LicenseType } from './../../types/interfaces';

export type {
	PanelInput,
	SelectActionInput,
	GeneralInput,
	PanelInputType,
	TournamentMatchup,
	KeyBind,
	TournamentStage,
	BOTypes,
	TournamentTypes,
	VetoScore,
	PanelTemplate,
	HUD,
	Player,
	Match,
	MatchTeam,
	Veto,
	VetoType,
	Tournament,
	Config,
	ExtendedConfig,
	CFG,
	CustomFieldEntry,
	LicenseType,
	CustomFieldStore,
	Team,
	AvailableGames,
	AvailableResources,
	onExtraChangeFunction,
	MapAreaConfig,
	MapConfig,
	Dota2Veto,
	Dota2Match,
	CSGOVeto,
	CSGOMatch,
	RocketLeagueVeto,
	Item,
	RocketLeagueMatch,
	ARModule
} from './../../types/interfaces';

export type HeaderHandler = (onBackClick: null | (() => void), header?: string | null) => void;

export interface CFGGSIObject {
	success: boolean;
	accessible: boolean;
	message?: string;
}

export interface CFGGSIResponse {
	csgo: CFGGSIObject;
	dota2: CFGGSIObject;
}

export interface User {
	id: number;
	email: string;
	password: string;
	admin: boolean;
	banned: boolean;
	username: string,
	token: string,
	license: License
}
export interface License {
	id: number;
	type: LicenseType;
	owner: number;
	status: string
	valid: boolean,
	endTime: number,
	validFrom: number,
	validUntil: Date,
	nextUpdate: number,
	startTime: number
}

export interface Customer {
	user: User;
	license: License;
	iat: number;
	exp: number;
}

export interface BakkesModStatus {
	bakkesModExeDownloaded: boolean;
	bakkesModDataDownloaded: boolean;
	bakkesModDataInstalled: boolean;
	sosPluginDownloaded: boolean;
	sosPluginInstalled: boolean;
	sosConfigSet: boolean;
	bakkesModRunning: boolean;
}

export interface BakkesModAPIResponse {
	success: boolean;
	message?: string;
	error?: any;
	path?: string;
}

export interface BakkesModStatusResponse extends BakkesModAPIResponse {
	status: BakkesModStatus;
}
