import {GardenPatchType} from "./GardenPatchType"
import {TopsoilId} from "./Topsoil"

export interface GardenPatch {
    type: GardenPatchType
    seeds: (number | null)[]
    topsoil: (TopsoilId | null)[]
}

export function hasSeedsPlanted(gardenPatch: GardenPatch): boolean {
    return gardenPatch.seeds.some(seedId => !!seedId);
}
