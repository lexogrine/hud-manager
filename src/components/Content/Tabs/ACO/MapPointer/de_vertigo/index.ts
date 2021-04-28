import radar from './radar.png'

const high = {
    "origin": {
        "x": 784.4793452283254,
        "y": 255.42597837029027
    },
    "pxPerUX": 0.19856123172015677,
    "pxPerUY": -0.19820052722907044
};

const low = {
    "origin": {
        "x": 780.5145858437052,
        "y": 695.4259783702903
    },
    "pxPerUX": 0.1989615567841087,
    "pxPerUY": -0.19820052722907044
};

const config = {
    configs: [
        {
            id: 'high',
            config: high,
            isVisible: (height: number) => height >= 11700,
        },
        {
            id: 'low',
            config: low,
            isVisible: (height: number) => height < 11700,
        },
    ],
    file: radar
}

export default config;
/*
import radar from './radar.png'

export default {
    "config": {
        "origin": {
            "x": 971.5536135341899,
            "y": 424.5618319055844
        },
        "pxPerUX": 0.34708183044632246,
        "pxPerUY": -0.3450882697407333
    },
    "file":radar
}*/