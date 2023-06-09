import { Objective } from "core";
import {next_id, ServerState} from "./map";
import {find_path_with_open_spot_around} from "./pathing";
import {add_unit} from "./units";

export function tick_objective(state: ServerState, objective: Objective) {
    if (objective.currently_spawning) {
        const now = Date.now();
        if (!objective.last_spawn_time || now - objective.last_spawn_time >= objective.currently_spawning.spawn_delay) {
            objective.last_spawn_time = now;
            const new_unit = {
                d: objective.currently_spawning.id,
                damage: objective.currently_spawning.damage,
                health: objective.currently_spawning.health,
                id: next_id(),
                last_step_time: 0,
                np_key: objective.np_key,
                path: find_path_with_open_spot_around(state, objective.spawn_x, objective.spawn_y, objective.rp_x, objective.rp_y),
                path_step: 0,
                x: objective.spawn_x,
                y: objective.spawn_y
            };
            add_unit(state, new_unit);
        }
    }
}