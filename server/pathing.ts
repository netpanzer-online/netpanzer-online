import {ServerState} from "./map";
import {AStar} from "fast-astar";

export function find_path(state: ServerState, from_x: number, from_y: number, to_x: number, to_y: number) {
    // fast-astar is not actually that fast. we should replace the grid with a float8array
    const astar = new AStar(state.grid); // it looks like we need to create this object every time, which creates several maps internally :(
    return astar.search([from_x, from_y], [to_x, to_y], {
        rightAngle: false // allow diagonal
    });
}