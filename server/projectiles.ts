import {Projectile} from "core";
import {ServerState} from "./map";

export function tick_projectile(state: ServerState, projectile: Projectile) {
    // example - todo - will we splice from array now or periodically GC projectiles??
    // state.pending_ops.push([OpType.ProjectileLanded, projectile.id]);
}
