import {OnLoadOptions} from "esbuild";

export type ProjectileID = number;
export type ProjectileX = number;
export type ProjectileY = number;

export interface Projectile {
    id: ProjectileID
    x: ProjectileX
    y: ProjectileY
}

export type UnitID = number;
export type UnitX = number;
export type UnitY = number;

export interface Unit {
    id: UnitID
    x: UnitX
    y: UnitY
}

export type ObjectiveID = number;

export interface Objective {
    id: ObjectiveID
}

export type TileData = string; // TODO
export type GameSessionId = string; // every session has a unique id to help with reconnections

export interface GameMap {
    sessionId: GameSessionId
    units: Unit[]
    objectives: Objective[]
    tiles?: TileData
}

export enum OpType {
    LoadMap = 'lm',
    UnitCreated = 'uc',
    UnitDestroyed = 'ud',
    ObjectiveClaimed = 'oc',
    ProjectileFired = 'pf',
    ProjectileLanded = 'pl',
}

export type LoadMapOp = [OpType.LoadMap, GameMap]; // sent on initial connect, and on reconnect.
export type UnitCreatedOp = [OpType.UnitCreated, Unit];
export type UnitDestroyedOp = [OpType.UnitDestroyed, UnitID];
export type ObjectiveClaimedOp = [OpType.ObjectiveClaimed, ObjectiveID];
export type ProjectileFiredOp = [OpType.ProjectileFired, ProjectileID];
export type ProjectileLandedOp = [OpType.ProjectileLanded, ProjectileID];

export type Op =
    LoadMapOp
    | UnitCreatedOp
    | UnitDestroyedOp
    | ObjectiveClaimedOp
    | ProjectileFiredOp
    | ProjectileLandedOp
