"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installF1 = exports.getF1Status = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const f1ConfigFile = path_1.default.join(electron_1.app.getPath('documents'), 'My Games', 'F1 2021', 'hardwaresettings', 'hardware_settings_config.xml');
const getF1Status = (req, res) => {
    const installed = fs_1.default.existsSync(f1ConfigFile);
    if (!installed) {
        return res.json({ installed: false, configured: false });
    }
    const content = fs_1.default.readFileSync(f1ConfigFile, 'utf-8').split('\n');
    const udpLine = content.find(line => line.includes('udp'));
    if (!udpLine) {
        return res.json({ installed: true, configured: false });
    }
    const configured = udpLine.includes(`enabled="true"`) && udpLine.includes(`"20777"`) && udpLine.includes(`ip="127.0.0.1"`);
    return res.json({ installed: true, configured });
};
exports.getF1Status = getF1Status;
const installF1 = (req, res) => {
    const installed = fs_1.default.existsSync(f1ConfigFile);
    if (!installed) {
        return res.sendStatus(404);
    }
    const content = fs_1.default.readFileSync(f1ConfigFile, 'utf-8').split('\n');
    const lineIndex = content.findIndex(line => line.includes('udp'));
    if (lineIndex === -1)
        return res.sendStatus(404);
    content[lineIndex] = `<udp enabled="true" broadcast="false" ip="127.0.0.1" port="20777" sendRate="20hz" format="2021" yourTelemetry="restricted" />`;
    const newContent = content.join('\n');
    fs_1.default.writeFileSync(f1ConfigFile, newContent, 'utf-8');
    return res.sendStatus(200);
};
exports.installF1 = installF1;
