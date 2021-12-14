import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';

const f1ConfigFile = path.join(
	app.getPath('documents'),
	'My Games',
	'F1 2021',
	'hardwaresettings',
	'hardware_settings_config.xml'
);

export const getF1Status: RequestHandler = (req, res) => {
	const installed = fs.existsSync(f1ConfigFile);
	if (!installed) {
		return res.json({ installed: false, configured: false });
	}
	const content = fs.readFileSync(f1ConfigFile, 'utf-8').split('\n');
	const udpLine = content.find(line => line.includes('udp'));

	if (!udpLine) {
		return res.json({ installed: true, configured: false });
	}

	const configured =
		udpLine.includes(`enabled="true"`) && udpLine.includes(`"20777"`) && udpLine.includes(`ip="127.0.0.1"`);

	return res.json({ installed: true, configured });
};

export const installF1: RequestHandler = (req, res) => {
	const installed = fs.existsSync(f1ConfigFile);
	if (!installed) {
		return res.sendStatus(404);
	}

	const content = fs.readFileSync(f1ConfigFile, 'utf-8').split('\n');

	const lineIndex = content.findIndex(line => line.includes('udp'));

	if (lineIndex === -1) return res.sendStatus(404);

	content[
		lineIndex
	] = `<udp enabled="true" broadcast="false" ip="127.0.0.1" port="20777" sendRate="20hz" format="2021" yourTelemetry="restricted" />`;

	const newContent = content.join('\n');

	fs.writeFileSync(f1ConfigFile, newContent, 'utf-8');

	return res.sendStatus(200);
};
