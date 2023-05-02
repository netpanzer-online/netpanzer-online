import {OpType, Projectile} from "core";
import {ServerState} from "./index";

export function tickProjectile(state: ServerState, projectile: Projectile) {
    // example - todo - will we splice from array now or periodically GC projectiles??
    state.pendingOps.push([OpType.ProjectileLanded, projectile.id]);
}
