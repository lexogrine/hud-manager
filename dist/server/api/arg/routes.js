"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const A = __importStar(require("./middlewares"));
const initRoute = () => {
    __1.app.route('/api/arg').get(A.requestARGStatus).post(A.connect).delete(A.disconnect);
    __1.app.route('/api/arg/delay').post(A.saveDelay);
    __1.app.route('/api/arg/save').post(A.saveClips);
    __1.app.route('/api/arg/order').get(A.getOrder).post(A.setOrder);
    __1.app.route('/api/arg/online').post(A.setOnline);
    __1.app.route('/api/arg/safeband').post(A.setSafeband);
    __1.app.route('/api/arg/hlae').post(A.setHLAE);
};
exports.default = initRoute;
