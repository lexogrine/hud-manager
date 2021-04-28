import radar from './radar.png'

const high = {
    "origin": {
        "x": 473.1284773048749,
        "y": 165.7329003801045
    },
    "pxPerUX": 0.14376095926926907,
    "pxPerUY": -0.14736670935219626
};

const low = {
    "origin": {
        "x": 473.66746071612374,
        "y": 638.302101754172
    },
    "pxPerUX": 0.1436068746398272,
    "pxPerUY": -0.14533406508526941
};

const config = {
    configs: [
        {
            id: 'high',
            config: high,
            isVisible: (height: number) => height >= -450,
        },
        {
            id: 'low',
            config: low,
            isVisible: (height: number) => height < -450,
        },
    ],
    file: radar
}

export default config;