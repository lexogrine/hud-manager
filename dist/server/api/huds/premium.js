"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPremiumHUDData = void 0;
const __1 = require("..");
const directories_1 = require("../../../init/directories");
const config_1 = require("../config");
const huds_1 = require("../huds");
const getPremiumHUDData = (game, config) => {
    if (game === 'dota2' || game === 'f1')
        return null;
    if (game === 'csgo')
        return {
            name: 'CS:GO Premium HUD',
            version: directories_1.LHMP[game],
            author: 'Lexogrine',
            legacy: false,
            dir: 'premiumhud',
            radar: true,
            panel: (!__1.customer.customer ||
                __1.customer.customer.license.type === 'personal' ||
                __1.customer.customer.license.type === 'free') &&
                !__1.customer.workspace
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
            publicKey: (0, huds_1.getHUDPublicKey)('premiumhud'),
            killfeed: true,
            keybinds: (!__1.customer.customer ||
                __1.customer.customer.license.type === 'personal' ||
                __1.customer.customer.license.type === 'free') &&
                !__1.customer.workspace
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
            url: `http://${config_1.internalIP}:${config.port}/hud/premiumhud/`,
            status: 'SYNCED',
            uuid: 'premium-turbo-hud1.0.0.',
            isDev: false
        };
    return {
        name: 'Rocket League Premium HUD',
        version: directories_1.LHMP[game],
        author: 'Lexogrine',
        legacy: false,
        dir: 'premiumhud',
        radar: true,
        game,
        publicKey: (0, huds_1.getHUDPublicKey)('premiumhud'),
        panel: (!__1.customer.customer ||
            __1.customer.customer.license.type === 'personal' ||
            __1.customer.customer.license.type === 'free') &&
            !__1.customer.workspace
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
                                    label: 'Future'
                                }
                            ]
                        },
                        {
                            type: 'checkbox',
                            name: 'hide_minimap',
                            label: 'Hide 3D minimap'
                        }
                    ]
                }
            ],
        killfeed: true,
        keybinds: [],
        url: `http://${config_1.internalIP}:${config.port}/hud/premiumhud/`,
        status: 'SYNCED',
        uuid: 'premium-turbo-hud-rl1.0.0.',
        isDev: false
    };
    return null;
};
exports.getPremiumHUDData = getPremiumHUDData;
