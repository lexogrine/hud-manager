"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInPolygon = void 0;
const isInPolygon = (p, polygon) => {
    let i = 0;
    let ii = 0;
    let k = 0;
    let f = 0;
    let u1 = 0;
    let v1 = 0;
    let u2 = 0;
    let v2 = 0;
    let currentP = null;
    let nextP = null;
    const x = p[0];
    const y = p[1];
    const numContours = polygon.length;
    for (i; i < numContours; i++) {
        ii = 0;
        const contourLen = polygon[i].length - 1;
        const contour = polygon[i];
        currentP = contour[0];
        u1 = currentP[0] - x;
        v1 = currentP[1] - y;
        for (ii; ii < contourLen; ii++) {
            nextP = contour[ii + 1];
            v2 = nextP[1] - y;
            if ((v1 < 0 && v2 < 0) || (v1 > 0 && v2 > 0)) {
                currentP = nextP;
                v1 = v2;
                u1 = currentP[0] - x;
                continue;
            }
            u2 = nextP[0] - p[0];
            if (v2 > 0 && v1 <= 0) {
                f = u1 * v2 - u2 * v1;
                if (f > 0)
                    k = k + 1;
                else if (f === 0)
                    return 0;
            }
            else if (v1 > 0 && v2 <= 0) {
                f = u1 * v2 - u2 * v1;
                if (f < 0)
                    k = k + 1;
                else if (f === 0)
                    return 0;
            }
            else if (v2 === 0 && v1 < 0) {
                f = u1 * v2 - u2 * v1;
                if (f === 0)
                    return 0;
            }
            else if (v1 === 0 && v2 < 0) {
                f = u1 * v2 - u2 * v1;
                if (f === 0)
                    return 0;
            }
            else if (v1 === 0 && v2 === 0) {
                if (u2 <= 0 && u1 >= 0) {
                    return 0;
                }
                else if (u1 <= 0 && u2 >= 0) {
                    return 0;
                }
            }
            currentP = nextP;
            v1 = v2;
            u1 = u2;
        }
    }
    if (k % 2 === 0)
        return false;
    return true;
};
exports.isInPolygon = isInPolygon;
