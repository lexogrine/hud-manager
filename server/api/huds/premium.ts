import { customer } from '..';
import { LHMP } from '../../../init/directories';
import { AvailableGames, Config, HUD } from '../../../types/interfaces';
import { internalIP } from '../config';
import { getHUDPublicKey } from '../huds';

export const getPremiumHUDData = (game: AvailableGames, config: Config) => {
	if (game === 'dota2' || game === 'f1') return null;
	if (game === 'csgo')
		return {
			name: 'CS:GO Premium HUD',
			version: LHMP[game],
			author: 'Lexogrine',
			legacy: false,
			dir: 'premiumhud',
			radar: true,
			panel:
				(!customer.customer ||
					customer.customer.license.type === 'personal' ||
					customer.customer.license.type === 'free') &&
				!customer.workspace
					? []
					: [
							{
								label: 'Themes',
								name: 'theme',
								inputs: [
									{
										type: 'select',
										name: 'theme_select',
										label: 'Select HUD Theme',
										values: [
											{
												name: 'csgo2',
												label: 'Sunset'
											},
											{
												name: 'redblue',
												label: 'Saber'
											},
											{
												name: 'dune',
												label: 'Dune'
											},
											{
												name: 'power',
												label: 'Energy'
											}
										]
									}
								]
							}
					  ],
			game,
			publicKey: getHUDPublicKey('premiumhud'),
			killfeed: true,
			keybinds:
				(!customer.customer ||
					customer.customer.license.type === 'personal' ||
					customer.customer.license.type === 'free') &&
				!customer.workspace
					? []
					: [
							{
								bind: 'Alt+S',
								action: 'setScoreboard'
							},
							{
								bind: 'Alt+Y',
								action: 'toggleCameraBoard'
							},
							{
								bind: 'Alt+W',
								action: 'setFunGraph'
							},
							{
								bind: 'Alt+C',
								action: 'toggleCams'
							},
							{
								bind: 'Alt+T',
								action: [
									{
										map: 'de_vertigo',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto 41.3 -524.8 12397.0 -0.1 153.8; spec_lerpto -24.1 335.8 12391.3 -4.0 -149.9 12 12'
										}
									},
									{
										map: 'de_mirage',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto -731.6 -734.9 129.5 7.2 60.7; spec_lerpto -42.5 -655.3 146.7 4.0 119.3 12 12'
										}
									},
									{
										map: 'de_inferno',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto -1563.1 -179.4 302.1 9.8 134.7; spec_lerpto -1573.8 536.6 248.3 6.1 -157.5 12 12'
										}
									},
									{
										map: 'de_dust2',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto 373.8 203.8 154.8 -17.6 -25.3; spec_lerpto 422.6 -315.0 106.0 -31.1 16.7 12 12'
										}
									},
									{
										map: 'de_overpass',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto -781.2 44.4 745.5 15.7 -101.3; spec_lerpto -1541.2 -1030.6 541.9 2.9 -35.8 12 12'
										}
									},
									{
										map: 'de_nuke',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto 800.0 -2236.4 -170.9 -1.0 -123.3; spec_lerpto -161.2 -2584.0 -127.2 -0.1 -60.4 12 12'
										}
									},
									{
										map: 'de_ancient',
										action: {
											action: 'toggleMainScoreboard',
											exec: 'spec_mode 5;spec_mode 6;spec_goto -813.4 -38.8 547.7 8.7 -21.2; spec_lerpto -723.9 -748.6 385.0 -14.3 17.4 12 12'
										}
									}
								]
							}
					  ],
			url: `http://${internalIP}:${config.port}/hud/premiumhud/`,
			status: 'SYNCED',
			uuid: 'premium-turbo-hud1.0.0.',
			isDev: false
		} as HUD;

	return {
		name: 'Rocket League Premium HUD',
		version: LHMP[game],
		author: 'Lexogrine',
		legacy: false,
		dir: 'premiumhud',
		radar: true,
		game,
		publicKey: getHUDPublicKey('premiumhud'),
		panel:
			(!customer.customer ||
				customer.customer.license.type === 'personal' ||
				customer.customer.license.type === 'free') &&
			!customer.workspace
				? []
				: [
						{
							label: 'Theme settings',
							name: 'theme',
							inputs: [
								{
									type: 'select',
									name: 'select_theme',
									label: 'Select alternative theme',
									values: [
										{
											name: 'greenViolet',
											label: 'Toxic'
										},
										{
											name: 'neon',
											label: 'Neon'
										},
										{
											name: 'denji',
											label: 'Rio'
										},
										{
											name: 'akira',
											label: 'Dimension'
										}
									]
								}
							]
						}
				  ],
		killfeed: true,
		keybinds: [],
		url: `http://${internalIP}:${config.port}/hud/premiumhud/`,
		status: 'SYNCED',
		uuid: 'premium-turbo-hud-rl1.0.0.',
		isDev: false
	} as HUD;
	return null;
};
