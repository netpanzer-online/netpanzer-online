export interface Player {
    username: string
    flag?: string
    score?: number
}

export type ProjectileID = number;
export type ProjectileX = number;
export type ProjectileY = number;
export enum ProjectileType {
    BULLET,
    MISSILE
}

export interface Projectile {
    // compact keys for serialization
    f: UnitID
    id: ProjectileID
    t: ProjectileType
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
    path?: [UnitX, UnitY][]
    path_step?: number
    last_step_time?: number
}

export type ObjectiveID = number;

export interface Objective {
    id: ObjectiveID
}

export type TileData = string; // TODO
export type SessionId = string; // every session has a unique id to help with reconnections

export type LoadMap = ['LoadMap', {
    session_id: SessionId
    units: Unit[]
    objectives: Objective[]
    tiles?: TileData
}]; // sent on initial connect, and on reconnect.
export type JoinGameReq = ['JoinGameReq', {
    player: Player,
    password?: string
}]
export type RejoinGameReq = ['RejoinGameReq', SessionId];
export type RejoinGameRes = ['RejoinGameRes', {
    allowed: boolean,
    message?: string
}];
export const MoveUnitReqCode = 'mur';
export const UnitPathUpdatedCode = 'upu';
export type MoveUnitReq = ['mur', UnitID, UnitX, UnitY]
export type UnitPathUpdated = ['upu', UnitID, [UnitX, UnitY][]]
// frequent op codes should have shorter values as an optimization
export type UnitCreated = ['uc', Unit];
export type UnitDestroyed = ['ud', UnitID];
export type ObjectiveClaimed = ['oc', ObjectiveID];
export type ProjectileFired = ['pf', Projectile];
export type ProjectileLanded = ['pl', ProjectileID];

export type Op =
    LoadMap
    | JoinGameReq
    | RejoinGameReq
    | RejoinGameRes
    | MoveUnitReq
    | UnitPathUpdated
    | UnitCreated
    | UnitDestroyed
    | ObjectiveClaimed
    | ProjectileFired
    | ProjectileLanded;
