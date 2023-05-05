import { Op } from "core";
import {WebSocket} from "ws";

export function send_op(ws: WebSocket, op: Op) {
    ws.send(JSON.stringify(op));
}
