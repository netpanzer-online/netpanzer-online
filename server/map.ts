import {JoinGameReq, Objective, Op, Player, Projectile, RejoinGameReq, SessionId, TileData, Unit} from "core";
import {send_op} from "./ops";
import {WebSocket} from "ws";
import {Grid} from "fast-astar";

export interface ServerState {
    clients: Client[]
    game_duration?: number
    game_end_time?: number // optionally have set map duration
    grid: Grid,
    last_user_connected_time?: number // if all users disconnect for a long period, we will drop the session.
    objectives: Objective[]
    max_players: number
    password?: string
    pending_ops: Op[]
    projectiles: Projectile[]
    session_id: SessionId
    tiles?: TileData
    units: Unit[]
}

interface Client {
    socket: WebSocket
    player: Player
}

let server_state: ServerState = get_new_server_state();

export function get_server_state(): ServerState {
    return server_state;
}

export function get_new_server_state(old?: ServerState): ServerState {
    return {
        clients: [],
        game_duration: old?.game_duration,
        game_end_time: old && old.game_duration ? Date.now() + old.game_duration : undefined,
        grid: new Grid({
            // note - this can take a lot of memory (10+mb) for larger maps. TODO experiment with custom A* with map-backed storage.
            // some other alternatives would be polygon based path finding
            col: 1024, // TODO based on map. Note - netpanzer did not have tile-based movement, even though the units positioned themselves in grids, units could be on the edge of a "tile".
            row: 1024
        }),
        last_user_connected_time: undefined,
        objectives: [],
        max_players: old?.max_players, // TODO per-map
        password: old?.password,
        pending_ops: [],
        projectiles: [],
        session_id: undefined,
        tiles: undefined,
        units: []
    }
}

// export function select_initial_map(): GameMap {
//
// }

export function tick_map(state: ServerState) {
    if (state.game_end_time > Date.now()) {
        return end_game(state);
    }
}

export function end_game(state: ServerState) {
    state.pending_ops = [];
    for (const client of state.clients) {
        client.socket.close();
    }
    server_state = get_new_server_state(state);
}

export function handle_player_join_request(ws: WebSocket, req: JoinGameReq) {
    if (server_state.clients.length === server_state.max_players) {
        send_op(ws, ['RejoinGameRes', {
            allowed: false,
            message: 'This server is full.'
        }]);
        return ws.close();
    }
    if (server_state.password && server_state.password !== req[1].password) {
        send_op(ws, ['RejoinGameRes', {
            allowed: false,
            message: 'Incorrect password.'
        }]);
        return ws.close();
    }
    send_op(ws, ['RejoinGameRes', {
        allowed: true
    }]);
    server_state.clients.push({
        socket: ws,
        player: {
            username: req[1].player.username,
            flag: req[1].player.flag
        }
    });
    send_op(ws, ['LoadMap', {
        session_id: server_state.session_id,
        units: server_state.units,
        objectives: server_state.objectives,
        tiles: server_state.tiles,
    }]);
}

// there are balance issues with this. for example. if a user leaves, what happens to their units?
// do they get temporarily taken over by a bot? do they get destroyed and added back again (prob terrible idea)? do they get frozen?
export function handle_player_re_join_request(ws: WebSocket, req: RejoinGameReq) {
    if (server_state.clients.length === server_state.max_players) {
        send_op(ws, ['RejoinGameRes', {
            allowed: false,
            message: 'This server is full.'
        }]);
        return ws.close();
    }
    if (server_state.session_id !== req[1]) {
        return send_op(ws, ['RejoinGameRes', {
            allowed: false,
            message: 'A new game is now in progress.'
        }]);
    }
    send_op(ws, ['RejoinGameRes', {
        allowed: true
    }]);
    // server_state.clients.push({
    //     socket: ws,
    //     player: req[1]
    // });
    send_op(ws, ['LoadMap', {
        session_id: server_state.session_id,
        units: server_state.units,
        objectives: server_state.objectives,
        tiles: server_state.tiles,
    }]);
}
