import {GardenPatch} from "../../models/GardenPatch"
import {ISeedStore, SeedDb} from "./useSeedStore"
import {GardenPatchType} from "../../models/GardenPatchType"
import {Cross} from "../../models/Cross"


export function findCrossCandidates(db: ISeedStore, patch: GardenPatch, seedIndex: number): Cross[] {
    const seedId = patch.seeds[seedIndex]
    if (!seedId) return []

    const crossSeedIndex = getSeedIndexToCrossWith(db, patch, seedIndex)
    if (crossSeedIndex == null) return []

    const crossSeedId = patch.seeds[crossSeedIndex]
    if (!crossSeedId) return [] // Can't happen but make TS happy

    return db.findCrossesByPair([ seedId, crossSeedId ])
}

function getSeedIndexToCrossWith(db: ISeedStore, patch: GardenPatch, seedIndex: number): number | null {
    const seedId = patch.seeds[seedIndex]
    if (!seedId) return null

    const [ primaryIndex, secondaryIndex ] = getSeedIndexesToCrossWith(patch.type, seedIndex)

    const primaryPlantedId = patch.seeds[primaryIndex]
    const secondaryPlantedId = patch.seeds[secondaryIndex]

    const primaryPotentialCrosses = primaryPlantedId
        ? db.findCrossesByPair([ seedId, primaryPlantedId ])
        : []
    const secondaryPotentialCrosses = secondaryPlantedId
        ? db.findCrossesByPair([ seedId, secondaryPlantedId ])
        : []

    if (primaryPotentialCrosses.length) return primaryIndex
    if (secondaryPotentialCrosses.length) return secondaryIndex
    return null
}

/*
 * https://www.ffxivgardening.com/intercross-priority-path
 */
const INTERCROSS_TABLE = {
    [GardenPatchType.Round]: [
        [1, 2],
        [3, 0],
        [3, 0],
        [1, 2]
    ],
    [GardenPatchType.Oblong]: [
        [1, 3],
        [2, 4],
        [5, 1],
        [4, 0],
        [5, 3],
        [2, 4]
    ],
    [GardenPatchType.Deluxe]: [
        [1, 7],
        [2, 0],
        [3, 1],
        [4, 2],
        [3, 5],
        [4, 6],
        [5, 7],
        [6, 0]
    ]
}

/**
 * Get potential seed indexes to cross with.
 *
 * @param type
 * @param seedIndex
 * @return primary (preferred) and secondary seed index to cross with
 */
function getSeedIndexesToCrossWith(type: GardenPatchType, seedIndex: number): [number, number] {
    return INTERCROSS_TABLE[type][seedIndex] as [number, number]
}