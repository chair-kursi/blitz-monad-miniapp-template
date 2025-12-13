"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvents = void 0;
var SocketEvents;
(function (SocketEvents) {
    // Client -> Server
    SocketEvents["AUTHENTICATE"] = "authenticate";
    SocketEvents["JOIN_GAME"] = "join_game";
    SocketEvents["CREATE_GAME"] = "create_game";
    SocketEvents["PLAY_NOW"] = "play_now";
    SocketEvents["TYPING_PROGRESS"] = "typing_progress";
    SocketEvents["LEAVE_GAME"] = "leave_game";
    // Server -> Client
    SocketEvents["AUTHENTICATED"] = "authenticated";
    SocketEvents["GAME_CREATED"] = "game_created";
    SocketEvents["GAME_JOINED"] = "game_joined";
    SocketEvents["SEARCHING_OPPONENT"] = "searching_opponent";
    SocketEvents["OPPONENT_FOUND"] = "opponent_found";
    SocketEvents["GAME_STARTED"] = "game_started";
    SocketEvents["PLAYER_JOINED"] = "player_joined";
    SocketEvents["PLAYER_LEFT"] = "player_left";
    SocketEvents["PROGRESS_UPDATE"] = "progress_update";
    SocketEvents["GAME_FINISHED"] = "game_finished";
    SocketEvents["ERROR"] = "error";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
//# sourceMappingURL=index.js.map