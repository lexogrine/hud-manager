import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('ipcApi', {
	send: (channel: string, ...data: any[]) => {
		ipcRenderer.send(channel, ...data);
	},
	receive: (channel: string, func: (...args: any[]) => void) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	}
});
