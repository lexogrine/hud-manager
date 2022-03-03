import Datastore from 'nedb';
import path from 'path';
import fs from 'fs';
import { app, session } from 'electron';
import * as I from './../types/interfaces';
import { ioPromise } from '../server/socket';

const directory = path.join(app.getPath('userData'), 'databases');

export const getBasePath = (customer: I.CustomerData, forceUserPath = false) => {
	if (!customer.customer) return directory;

	if (customer.workspace && !forceUserPath) {
		return path.join(directory, 'workspaces', customer.workspace.id.toString());
	}

	return path.join(directory, 'users', customer.customer.user.id.toString());
};

const listeners: ((() => void) | (() => Promise<void>))[] = [];

export const onDatabaseLoad = (listener: () => void) => {
	listeners.push(listener);
};

type SessionStore = {
	workspace: number | null;
	game: I.AvailableGames | null;
};

const sessionStorePath = path.join(directory, 'sessionStore');

export const sessionStoreContext: { session: SessionStore } = { session: { workspace: null, game: null } };

type DatabaseStructure = {
	players: Datastore<I.Player>;
	teams: Datastore<I.Team>;
	config: Datastore<I.Config>;
	matches: Datastore<I.Match>;
	custom: Datastore<I.CustomFieldStore>;
	tournaments: Datastore<I.Tournament>;
	aco: Datastore<I.MapConfig>;
};

const saveSessionStore = () => {
	fs.writeFileSync(sessionStorePath, JSON.stringify(sessionStoreContext.session), 'utf8');
};

const loadSessionStore = () => {
	if (!fs.existsSync(sessionStorePath)) {
		saveSessionStore();
		return;
	}
	sessionStoreContext.session = JSON.parse(fs.readFileSync(sessionStorePath, 'utf-8'));
};

loadSessionStore();

export const setSessionStore = (session: { workspace?: number | null; game?: I.AvailableGames | null }) => {
	if (session.workspace !== undefined) {
		sessionStoreContext.session.workspace = session.workspace;
	}
	if (session.game !== undefined) {
		sessionStoreContext.session.game = session.game;
	}

	saveSessionStore();
};

const getEmptyDb = () => {
	return {} as DatabaseStructure;
};

const databaseContext = {
	databases: {} as DatabaseStructure
};

const loadDatabase = async (basePath: string) => {
	databaseContext.databases.players = new Datastore<I.Player>({
		filename: path.join(basePath, 'players'),
		autoload: true
	});
	databaseContext.databases.teams = new Datastore<I.Team>({ filename: path.join(basePath, 'teams'), autoload: true });
	databaseContext.databases.config = new Datastore<I.Config>({
		filename: path.join(basePath, 'config'),
		autoload: true
	});
	databaseContext.databases.matches = new Datastore<I.Match>({
		filename: path.join(basePath, 'matches'),
		autoload: true
	});
	databaseContext.databases.custom = new Datastore<I.CustomFieldStore>({
		filename: path.join(basePath, 'custom'),
		autoload: true
	});
	databaseContext.databases.tournaments = new Datastore<I.Tournament>({
		filename: path.join(basePath, 'tournaments'),
		autoload: true
	});
	databaseContext.databases.aco = new Datastore<I.MapConfig>({
		filename: path.join(basePath, 'aco'),
		autoload: true
	});
	for (const listener of listeners) {
		await listener();
	}
	ioPromise.then(io => {
		io.emit('config');
	});
};

const moveDatabaseFile = (file: string, target: string) => {
	return fs.promises.rename(path.join(directory, file), path.join(target, file));
};

const moveToNewDatabaseSystem = async (target: string) => {
	if (!fs.existsSync(path.join(directory, 'players'))) return;

	const filesToMove = ['players', 'teams', 'config', 'matches', 'custom', 'tournaments', 'aco'];

	await Promise.all(filesToMove.map(file => moveDatabaseFile(file, target)));

	if (!fs.existsSync(path.join(directory, 'lastUpdated.lhm'))) return;

	await fs.promises.rename(path.join(directory, 'lastUpdated.lhm'), path.join(target, 'lastUpdated.lhm'));
};

export const loadUsersDatabase = async (customer: I.CustomerData) => {
	if (!customer || !customer.customer) {
		databaseContext.databases = getEmptyDb();
		return;
	}

	setSessionStore({ workspace: customer.workspace?.id, game: customer.game });

	if (customer.workspace) {
		const workspacePath = path.join(directory, 'workspaces', customer.workspace.id.toString());
		if (!fs.existsSync(workspacePath)) {
			fs.mkdirSync(workspacePath);
		}
	}
	const userPath = path.join(directory, 'users', customer.customer.user.id.toString());
	if (!fs.existsSync(userPath)) {
		fs.mkdirSync(userPath);
	}

	await moveToNewDatabaseSystem(getBasePath(customer, true));

	const pathForDatabase = getBasePath(customer);

	if (customer.workspace) {
		await loadDatabase(pathForDatabase);
		return;
	}

	await loadDatabase(pathForDatabase);
};

export { databaseContext };
