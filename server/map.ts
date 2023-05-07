import {
    JoinGameReq,
    Objective,
    Op,
    Player,
    Projectile,
    RejoinGameReq,
    SessionId,
    TileData,
    Unit,
    UnitDefinition, UnitDefinitionID, UnitID
} from "core";
import {send_op} from "./ops";
import {WebSocket} from "ws";
import {NavMesh} from "navmesh";
import RBush from "rbush";

class UnitIndex extends RBush<Unit> {
    toBBox(unit: Unit) {
        // this could potentially be a performance problem, but we'll see
        const definition = server_state.unit_definitions[unit.d];
        const size_half = definition.size / 2;
        return {
            minX: unit.x - size_half,
            minY: unit.y - size_half,
            maxX: unit.x + size_half,
            maxY: unit.y + size_half
        };
    }

    compareMinX(a, b) {
        return a.x - b.x;
    }

    compareMinY(a, b) {
        return a.y - b.y;
    }
}

export interface ServerState {
    clients: Client[]
    game_duration?: number
    game_end_time?: number // optionally have set map duration
    id_counter: number
    last_user_connected_time?: number // if all users disconnect for a long period, we will drop the session.
    objectives: Objective[]
    objective_index: RBush<Objective>, // to quickly see if unit is taking an objective
    max_players: number
    navmesh: NavMesh, // for navigation - around buildings, hills, etc
    password?: string
    pending_ops: Op[]
    projectiles: Projectile[]
    session_id: SessionId
    tiles?: TileData
    units: Unit[]
    units_by_id: Map<UnitID, Unit>
    unit_definitions: Map<UnitDefinitionID, UnitDefinition>,
    unit_index: UnitIndex, // to find units in range, and find open positions to move, etc
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
        id_counter: 0,
        last_user_connected_time: undefined,
        objectives: [],
        objective_index: new RBush<Objective>(16),
        max_players: old?.max_players, // TODO per-map
        navmesh: new NavMesh([]), // TODO build mesh from map
        password: old?.password,
        pending_ops: [],
        projectiles: [],
        session_id: undefined,
        tiles: undefined,
        units: [],
        units_by_id: new Map<UnitID, Unit>(),
        unit_definitions: new Map<UnitDefinitionID, UnitDefinition>(), // TODO read from config
        unit_index: new UnitIndex(10)
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
    // TODO VALIDATE KEY
    // TODO VALIDATE duplicate username (?)
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
            key: req[1].player.key,
            username: req[1].player.username,
            flag: req[1].player.flag
        }
    });
    send_op(ws, ['LoadMap', {
        session_id: server_state.session_id,
        server_time: Date.now(),
        units: server_state.units,
        objectives: server_state.objectives,
        unit_definitions: server_state.unit_definitions,
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
        server_time: Date.now(),
        objectives: server_state.objectives,
        tiles: server_state.tiles,
        units: server_state.units,
        unit_definitions: server_state.unit_definitions,
    }]);
}

export function next_id() {
    server_state.id_counter++;
    return server_state.id_counter;
}
