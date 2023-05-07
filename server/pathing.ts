import {ServerState} from "./map";

export function find_path(state: ServerState, from_x: number, from_y: number, to_x: number, to_y: number): [number, number][] {
    const raw = state.navmesh.findPath({
        x: from_x,
        y: from_y
    }, {
        x: to_x,
        y: to_y
    });
    const result = [];
    // this is not great, but sending many objects over wire with repeated x/y is not either.
    // we will probably have to fork "navmesh" to return the type we want, which gets rid of allocating this second array.
    // also, the navmesh library has many internal allocations it makes that are unnecessary.
    for (const item of raw) {
        result.push([item.x, item.y]);
    }
    return result;
}
