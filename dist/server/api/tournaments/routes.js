"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var T = __importStar(require("./middlewares"));
var initRoute = function (router) {
    router.route('/api/tournaments').get(T.getTournaments).post(T.addTournament);
    router
        .route('/api/tournaments/:id')
        .post(T.bindMatchToMatchup)
        .patch(T.updateTournament)["delete"](T.deleteTournament);
};
exports["default"] = initRoute;
