import {Projectile, SessionId, Objective, TileData, Unit, Player, Op, MoveUnitReq, MoveUnitReqCode} from "core"
import {WebSocket, WebSocketServer} from 'ws';
import {handle_move_unit_request, tick_unit} from "./units";
import {tick_projectile} from "./projectiles";
import {tick_objective} from "./objectives";
import {
    get_new_server_state,
    get_server_state,
    handle_player_join_request,
    handle_player_re_join_request,
    tick_map
} from "./map";

const TARGET_FPS = 100;
const TARGET_FRAME_MS = 1_000 / TARGET_FPS;
let last_frame_report_time = Date.now();

function tick() {
    const start = Date.now();
    const server_state = get_server_state();
    for (const bullet of server_state.projectiles) {
        tick_projectile(server_state, bullet);
    }
    for (const unit of server_state.units) {
        tick_unit(server_state, unit);
    }
    for (const obj of server_state.objectives) {
        tick_objective(server_state, obj);
    }
    tick_map(server_state); // game count down timer, win scenarios, etc

    for (const op of server_state.pending_ops) {
        const opStr = JSON.stringify(op); // we could also use msgpack or something, however this should normally only be a few bytes
        for (const client of server_state.clients) {
            client.socket.send(opStr);
        }
    }
    server_state.pending_ops = []; // on client reconnect we just send whole game state, so don't need to keep ops around past one tick

    const end = Date.now();
    if (start - last_frame_report_time > 1000) {
        const frame_duration = end - start;
        console.log(`Frame Time: ${frame_duration}ms, ~${(1000 / frame_duration).toFixed(0)}fps`);
        last_frame_report_time = start;
    }
    setTimeout(tick, Math.min(end - (start + TARGET_FRAME_MS), TARGET_FRAME_MS));
}
tick();

const wss = new WebSocketServer({port: 8787});
wss.on('connection', function connection(ws) {
    console.log('Got a connection.');
    get_server_state().last_user_connected_time = Date.now();

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        // console.log('received', data);
        try {
            const op: Op = JSON.parse(data.toString('utf8'));
            switch (op[0]) {
                case 'JoinGameReq':
                    handle_player_join_request(ws, op);
                    break;
                case 'RejoinGameReq':
                    handle_player_re_join_request(ws, op);
                    break;
                case MoveUnitReqCode:
                    handle_move_unit_request(ws, op);
                    break;
            }
        } catch (e) {
            console.error('Failed to handle message', data, e);
        }
    });

    ws.send('something');
});

