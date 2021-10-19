import { IGlobalKeyServer } from './_types/IGlobalKeyServer';
import { ChildProcess, execFile } from 'child_process';
import { IGlobalKeyEvent } from './_types/IGlobalKeyEvent';
import { IGlobalKeyListenerRaw } from './_types/IGlobalKeyListenerRaw';
import { WinGlobalKeyLookup } from './_data/WinGlobalKeyLookup';
import Path from 'path';
import { IWindowsConfig } from './_types/IWindowsConfig';
import { isSpawnEventSupported } from './isSpawnEventSupported';
import fs from 'fs';

const sPath = Path.join(__dirname, './../../bin/WinKeyServer.exe');

/** Use this class to listen to key events on Windows OS */
export class WinKeyServer implements IGlobalKeyServer {
	protected listener: IGlobalKeyListenerRaw;
	private proc: ChildProcess;

	protected config: IWindowsConfig;

	/**
	 * Creates a new key server for windows
	 * @param listener The callback to report key events to
	 * @param windowsConfig The optional windows configuration
	 */
	public constructor(listener: IGlobalKeyListenerRaw, config: IWindowsConfig = {}) {
		this.listener = listener;
		this.config = config;
		this.proc = null as any;
	}

	/** Start the Key server and listen for keypresses */
	public async start() {
		this.proc = execFile(sPath);
		if (this.config.onInfo) this.proc?.stderr?.on('data', data => this.config.onInfo?.(data.toString()));
		if (this.config.onError) this.proc.on('close', this.config.onError);

		this.proc?.stdout?.on('data', data => {
			const events = this._getEventData(data);
			for (const { event, eventId } of events) {
				const stopPropagation = !!this.listener(event);

				this.proc?.stdin?.write(`${stopPropagation ? '1' : '0'},${eventId}\n`);
			}
		});

		return new Promise<void>((res, err) => {
			this.proc.on('error', err);

			if (isSpawnEventSupported()) this.proc.on('spawn', res);
			// A timed fallback if the spawn event is not supported
			else setTimeout(res, 200);
		});
	}

	/** Stop the Key server */
	public stop() {
		this.proc?.stdout?.pause();
		this.proc.kill();
	}

	/**
	 * Obtains a IGlobalKeyEvent from stdout buffer data
	 * @param data Data from stdout
	 * @returns The standardized key event data
	 */
	protected _getEventData(data: any): { event: IGlobalKeyEvent; eventId: string }[] {
		const sData: string = data.toString();
		const lines = sData.trim().split(/\n/);
		return lines.map(line => {
			const lineData = line.replace(/\s+/, '');
			const arr = lineData.split(',');
			const vKey = parseInt(arr[0]);
			const key = WinGlobalKeyLookup[vKey];
			const keyDown = /DOWN/.test(arr[1]);
			const scanCode = parseInt(arr[2]);
			const eventId = arr[3];
			return {
				event: {
					vKey,
					rawKey: key,
					name: key?.standardName,
					state: keyDown ? 'DOWN' : 'UP',
					scanCode,
					_raw: sData
				},
				eventId
			};
		});
	}
}
