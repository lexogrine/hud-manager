import { MapAreaConfig, MapConfig } from "../../../types/interfaces";


const tSpawn: MapAreaConfig = {
    name: "T_SPAWN",
    polygonCorners: [
        [1101.7962, 100.5449],
        [1443.0434, 120.2615],
        [1453.0800, -392.3705],
        [1121.8695, -382.5122],
    ],
    configs: ["spec_mode 5;spec_mode 6;spec_goto 1278.9 655.6 -211.9 11.2 -88.8;spec_lerpto 1271.7 166.9 -52.3 11.0 -91.6 4 4"],
    priority: 0
}

const tSpawnA: MapAreaConfig = {
    name: "T_SPAWN_A",
    polygonCorners: [
        [713.7751 , -564.6353],
        [1393.0040 , -564.6353],
        [1422.9700 , -1508.1120],
        [673.8205 , -1448.5240],
    ],
    configs: ["spec_mode 5;spec_mode 6;spec_goto 1309.4 -817.4 114.4 21.0 98.9;spec_lerpto 1369.9 -1072.0 117.5 42.7 -161.0 4 4"],
    priority: 0
}
const tSpawnB: MapAreaConfig = {
    name: "T_SPAWN_B",
    polygonCorners: [
        [176.3284 , 691.3078],
        [186.2224 , 301.0953],
        [1393.2881 , 231.0572],
        [1403.1820 , 711.3187],
    ],
    configs: ["spec_mode 5;spec_mode 6;spec_goto 1313.0 421.7 73.9 22.2 -124.2;spec_lerpto 1134.3 662.2 79.3 23.2 -156.0 4 4"],
    priority: 0
}

const config: MapConfig = {
    map: "de_mirage",
    areas: [ tSpawn, tSpawnA, tSpawnB ],
}

export { config };
