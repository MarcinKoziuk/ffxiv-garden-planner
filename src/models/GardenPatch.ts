import {GardenPatchConstants, GardenPatchType} from "./GardenPatchType"
import {TopsoilId} from "./Topsoil"

export interface GardenPatch {
    type: GardenPatchType
    seeds: (number | null)[]
    topsoil: (TopsoilId | null)[]
}

export function hasSeedsPlanted(gardenPatch: GardenPatch): boolean {
    return gardenPatch.seeds.some(seedId => !!seedId);
}

export function getPatchIndices(gardenPatch: GardenPatch): number[] {
    // @ts-ignore
    return [ ...Array(GardenPatchConstants[gardenPatch.type].numberOfBeds).keys() ]
}