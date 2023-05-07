export type NPKey = string; // your netpanzer key
export type ServerTime = number;

export interface Player {
    key: NPKey
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
    np_key: NPKey
    d: UnitDefinitionID,
    x: UnitX
    y: UnitY
    health: number
    damage: number
    path: [UnitX, UnitY][]
    path_step: number
    last_step_time: number
}

export type UnitDefinitionID = number;

export interface UnitDefinition {
    id: UnitDefinitionID
    damage: number
    health: number
    shoot_delay: number
    size: number
    spawn_delay: number
}

export type ObjectiveID = number;
export type ObjectiveSpawnX = number;
export type ObjectiveSpawnY = number;
export type ObjectiveRallyPointX = number;
export type ObjectiveRallyPointY = number;
export type ObjectiveBoundStartX = number;
export type ObjectiveBoundStartY = number;
export type ObjectiveBoundEndX = number;
export type ObjectiveBoundEndY = number;

export interface Objective {
    minX: ObjectiveBoundStartX,
    minY: ObjectiveBoundStartY,
    maxX: ObjectiveBoundEndX,
    maxY: ObjectiveBoundEndY,
    currently_spawning?: UnitDefinition
    id: ObjectiveID
    last_spawn_time?: number
    np_key: NPKey
    rp_x: ObjectiveRallyPointX
    rp_y: ObjectiveRallyPointY
    spawn_x: ObjectiveSpawnX
    spawn_y: ObjectiveSpawnY
}

export type TileData = string; // TODO
export type SessionId = string; // every session has a unique id to help with reconnections

export type LoadMap = ['LoadMap', {
    session_id: SessionId
    server_time: ServerTime
    units: Unit[]
    unit_definitions: Map<UnitDefinitionID, UnitDefinition>
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
