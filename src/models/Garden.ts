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

export function getPatchIndices(garden: Garden): number[] {
    // @ts-ignore
    return [...(Array(garden.houseSize).keys())];
}