import { LicenseType } from './../../types/interfaces';

export type {
	PanelInput,
	SelectActionInput,
	GeneralInput,
	PanelInputType,
	KeyBind,
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
	ARModule
} from './../../types/interfaces';

export interface CFGGSIObject {
	success: boolean;
	accessible: boolean;
	message?: string;
}

export interface CFGGSIResponse {
	csgo: CFGGSIObject,
	dota2: CFGGSIObject,
}

export interface User {
	id: number;
	email: string;
	password: string;
	admin: boolean;
	banned: boolean;
}
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
