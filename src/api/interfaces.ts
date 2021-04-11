export type {
	PanelInput,
	SelectActionInput,
	GeneralInput,
	PanelInputType,
	KeyBind,
	PanelTemplate,
	HUD,
	Match,
	MatchTeam,
	Veto,
	VetoType,
	Tournament,
	Config,
	ExtendedConfig,
	CFG,
	CustomFieldEntry,
	CustomFieldStore,
	onExtraChangeFunction
} from './../../types/interfaces';

export interface Player {
	_id: string;
	firstName: string;
	lastName: string;
	username: string;
	avatar: string;
	country: string;
	steamid: string;
	team: string;
	extra: Record<string, string>;
}

export interface Team {
	_id: string;
	name: string;
	country: string;
	shortName: string;
	logo: string;
	extra: Record<string, string>;
}

export interface CFGGSIResponse {
	success: boolean;
	accessible: boolean;
	message?: string;
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

export interface BakkesModStatus {
	bakkesModDownloaded: boolean;
	bakkesModInstalled: boolean;
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
