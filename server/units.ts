import {MoveUnitReq, Unit, UnitID, UnitPathUpdatedCode} from "core";
import {get_server_state, ServerState} from "./map";
import {WebSocket} from "ws";
import {AStar} from "fast-astar";

export function tick_unit(state: ServerState, unit: Unit) {

}

export function add_unit(state: ServerState, unit: Unit) {

}

export function get_unit(state: ServerState, unit_id: UnitID) : Unit | null {
    for (const unit of state.units) {
        if (unit.id === unit_id) {
            return unit;
        }
    }
    return null;
}

export function handle_move_unit_request(ws: WebSocket, req: MoveUnitReq) {
    const state = get_server_state();
    const [_, unit_id, new_target_x, new_target_y] = req;
    const unit = get_unit(state, unit_id);
    if (!unit) {
        return // TODO send err
    }
    const astar = new AStar(state.grid); // it looks like we need to create this object every time, which creates several maps internally :(
    const path = astar.search([unit.x, unit.y], [new_target_x, new_target_y], {
        rightAngle: false // allow diagonal
    });
    unit.path = path;
    unit.path_step = 0;
    unit.last_step_time = 0;
    // then send new path to all clients
    state.pending_ops.push([
        UnitPathUpdatedCode, unit.id, path
    ]);
}
