import {Projectile, GameMap, GameSessionId, Objective, Op, TileData, Unit} from "core"
import {WebSocket, WebSocketServer} from 'ws';
import {select_initial_map} from "./map";
import {tickUnit} from "./units";
import {tickProjectile} from "./projectiles";

export interface ServerState {
    projectiles: Projectile[]
    sessionId: GameSessionId
    units: Unit[]
    objectives: Objective[]
    tiles?: TileData
    lastUserConnectedTime?: number // if all users disconnect for a long period, we will drop the session.
    password?: string
    clients: Client[]
    pendingOps: Op[]
}

interface Client {
    connectionId: string
    socket: WebSocket
}

let serverState: ServerState = {
    currentMap: select_initial_map(),
    lastUserConnectedTime: undefined,
    password: undefined,
    clients: [],
    pendingOps: []
}

function tick() {
    for (const bullet of serverState.projectiles) {
        tickProjectile(serverState, bullet);
    }
    for (const unit of serverState.units) {
        tickUnit(serverState, unit);
    }
    for (const obj of serverState.objectives) {
        tickObjective(serverState, obj);
    }
    tickMap(); // game count down timer, win scenarios, etc
    // TODO cleanup?
    for (const op of serverState.pendingOps) {
        const opStr = JSON.stringify(op); // we could also use msgpack or something, however this should normally only be a few bytes
        for (const client of serverState.clients) {
            client.socket.send(opStr);
        }
    }
    serverState.pendingOps = []; // on client reconnect we just send whole game state, so don't need to keep ops around past one tick
    process.nextTick(() => { // TODO set target FPS, also maybe throttle when no clients connected.
        tick();
    });
}
tick();

const wss = new WebSocketServer({port: 8787});
wss.on('connection', function connection(ws) {
    console.log('Got a connection.');
    // TODO handshake
    serverState.lastUserConnectedTime = Date.now();

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
});
