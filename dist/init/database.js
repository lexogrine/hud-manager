"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseContext = exports.loadUsersDatabase = exports.onDatabaseLoad = exports.getBasePath = void 0;
const nedb_1 = __importDefault(require("nedb"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const socket_1 = require("../server/socket");
const directory = path_1.default.join(electron_1.app.getPath('userData'), 'databases');
const getBasePath = (customer, forceUserPath = false) => {
    if (!customer.customer)
        return directory;
    if (customer.workspace && !forceUserPath) {
        return path_1.default.join(directory, 'workspaces', customer.workspace.id.toString());
    }
    return path_1.default.join(directory, 'users', customer.customer.user.id.toString());
};
exports.getBasePath = getBasePath;
const listeners = [];
const onDatabaseLoad = (listener) => {
    listeners.push(listener);
};
exports.onDatabaseLoad = onDatabaseLoad;
const getEmptyDb = () => {
    return {};
};
const databaseContext = {
    databases: {}
};
exports.databaseContext = databaseContext;
const loadDatabase = async (basePath) => {
    databaseContext.databases.players = new nedb_1.default({
        filename: path_1.default.join(basePath, 'players'),
        autoload: true
    });
    databaseContext.databases.teams = new nedb_1.default({ filename: path_1.default.join(basePath, 'teams'), autoload: true });
    databaseContext.databases.config = new nedb_1.default({
        filename: path_1.default.join(basePath, 'config'),
        autoload: true
    });
    databaseContext.databases.matches = new nedb_1.default({
        filename: path_1.default.join(basePath, 'matches'),
        autoload: true
    });
    databaseContext.databases.custom = new nedb_1.default({
        filename: path_1.default.join(basePath, 'custom'),
        autoload: true
    });
    databaseContext.databases.tournaments = new nedb_1.default({
        filename: path_1.default.join(basePath, 'tournaments'),
        autoload: true
    });
    databaseContext.databases.aco = new nedb_1.default({
        filename: path_1.default.join(basePath, 'aco'),
        autoload: true
    });
    for (const listener of listeners) {
        await listener();
    }
    socket_1.ioPromise.then(io => {
        io.emit('config');
    });
};
const moveDatabaseFile = (file, target) => {
    return fs_1.default.promises.rename(path_1.default.join(directory, file), path_1.default.join(target, file));
};
const moveToNewDatabaseSystem = async (target) => {
    if (!fs_1.default.existsSync(path_1.default.join(directory, 'players')))
        return;
    const filesToMove = ['players', 'teams', 'config', 'matches', 'custom', 'tournaments', 'aco'];
    await Promise.all(filesToMove.map(file => moveDatabaseFile(file, target)));
    if (!fs_1.default.existsSync(path_1.default.join(directory, 'lastUpdated.lhm')))
        return;
    await fs_1.default.promises.rename(path_1.default.join(directory, 'lastUpdated.lhm'), path_1.default.join(target, 'lastUpdated.lhm'));
};
const loadUsersDatabase = async (customer) => {
    if (!customer || !customer.customer) {
        databaseContext.databases = getEmptyDb();
        return;
    }
    if (customer.workspace) {
        const workspacePath = path_1.default.join(directory, 'workspaces', customer.workspace.id.toString());
        if (!fs_1.default.existsSync(workspacePath)) {
            fs_1.default.mkdirSync(workspacePath);
        }
    }
    const userPath = path_1.default.join(directory, 'users', customer.customer.user.id.toString());
    if (!fs_1.default.existsSync(userPath)) {
        fs_1.default.mkdirSync(userPath);
    }
    await moveToNewDatabaseSystem((0, exports.getBasePath)(customer, true));
    const pathForDatabase = (0, exports.getBasePath)(customer);
    if (customer.workspace) {
        await loadDatabase(pathForDatabase);
        return;
    }
    await loadDatabase(pathForDatabase);
};
exports.loadUsersDatabase = loadUsersDatabase;
