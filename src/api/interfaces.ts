
export interface Player {
    _id: string,
    firstName: string,
    lastName: string,
    username: string,
    avatar: string,
    country: string,
    steamid: string
};

export interface Team {
    _id: string,
    name: string,
    country: string,
    shortName: string,
    logo: string,
};

export interface Config {
    port: number,
    steamApiKey: string,
    token: string,

    /*"PrintPlayerData": false,
    "DisplayAvatars": true,
    "DisplayPlayerAvatars": true,
    "DisplayTeamFlags": false,
    "DisplayPlayerFlags": true,
    "SpecialEvent": "SHOWMATCH",
    "LeftImage": "/files/league/league.png",
    "LeftPrimary": "Primary League Text",
    "LeftSecondary": "Secondary League Text",
    "RightImage": "/files/img/elements/icon_microphone.png",
    "RightPrimary": "Make sure to follow me",
    "RightSecondary": "@KomodoAU on Twitter and Twitch",
    "GSIToken": "120987"*/
}
export interface Match {
    left: {
        id: string | null,
        wins: number
    },
    right: {
        id: string | null,
        wins: number
    },
    matchType: 'bo1' | 'bo2' | 'bo3' | 'bo5',
    vetos: { teamId: string, mapName: string, side: 'CT' | 'T' }[]
}