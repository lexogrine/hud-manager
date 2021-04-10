import Datastore from 'nedb';
import path from 'path';
import { app } from 'electron';
import * as I from './../types/interfaces';

const directory = path.join(app.getPath('userData'), 'databases');

const databases = {
	players: new Datastore<I.Player>({ filename: path.join(directory, 'players'), autoload: true }),
	teams: new Datastore<I.Team>({ filename: path.join(directory, 'teams'), autoload: true }),
	config: new Datastore<I.Config>({ filename: path.join(directory, 'config'), autoload: true }),
	matches: new Datastore<I.Match>({ filename: path.join(directory, 'matches'), autoload: true }),
	custom: new Datastore<I.CustomFieldStore>({ filename: path.join(directory, 'custom'), autoload: true }),
	tournaments: new Datastore<I.Tournament>({ filename: path.join(directory, 'tournaments'), autoload: true })
};

const testPlayers: I.Player[] = [
	{
		firstName: 'Hubert',
		lastName: 'Walczak',
		username: '0sh10',
		avatar: '',
		country: 'PL',
		steamid: '123456789',
		team: '',
		extra: {}
	},
	{
		firstName: 'Michał',
		lastName: 'Majka',
		username: 'esterling',
		avatar: '',
		country: 'US',
		steamid: '1234567891',
		team: '',
		extra: {}
	},
	{
		firstName: 'Kacper',
		lastName: 'Herchel',
		username: 'kacperski1',
		avatar: '',
		country: 'UK',
		steamid: '1234567894',
		team: '',
		extra: {}
	}
];

databases.players.find({}, (err: any, player: I.Player[]) => {
	if (player.length) return;

	databases.players.insert(testPlayers, (err, doc) => {});
});

export default databases;
