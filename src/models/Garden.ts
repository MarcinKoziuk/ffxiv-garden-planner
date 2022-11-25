import {GardenPatch} from "./GardenPatch"
import {Identifiable} from "./Identifiable"
import {SUUID} from "short-uuid"
import {TopsoilId} from "./Topsoil"

export enum HouseSize {
    Small = 1,
    Medium = 2,
    Large = 3
}

export interface Garden extends Identifiable<SUUID> {
    name: string
    houseSize: HouseSize,
    patches: GardenPatch[],
    defaultTopsoil: TopsoilId | null
}

/**
 * Returns possible indices for the garden patch according to house size.
 * @example a garden with houseSize 3 returns [ 0, 1, 2 ]
 * @param garden the garden
 */
export function getPatchIndices(garden: Garden): number[] {
    return new Array(garden.houseSize).fill(0).map((_, i) => i)
}