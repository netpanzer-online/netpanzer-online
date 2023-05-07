import {MoveUnitReq, Unit, UnitID, UnitPathUpdatedCode} from "core";
import {get_server_state, ServerState} from "./map";
import {WebSocket} from "ws";
import {find_path} from "./pathing";

export function tick_unit(state: ServerState, unit: Unit) {
    // TODO check if in objective and increment counter
    // TODO check if idle and shoot nearby
}

export function add_unit(state: ServerState, unit: Unit) {
    state.unit_index.insert(unit);
    state.units.push(unit);
    state.units_by_id.set(unit.id, unit);
    state.pending_ops.push(['uc', unit]);
}

export function get_unit(state: ServerState, unit_id: UnitID) : Unit | null {
    return state.units_by_id.get(unit_id);
}

export function handle_move_unit_request(ws: WebSocket, req: MoveUnitReq) {
    const state = get_server_state();
    const [_, unit_id, new_target_x, new_target_y] = req;
    const unit = get_unit(state, unit_id);
    if (!unit) {
        return // TODO send err
    }
    const path = find_path(state, unit.x, unit.y, new_target_x, new_target_y);
    unit.path = path;
    unit.path_step = 0;
    unit.last_step_time = Date.now();
    // then send new path to all clients
    state.pending_ops.push([
        UnitPathUpdatedCode, unit.id, path
    ]);
}
