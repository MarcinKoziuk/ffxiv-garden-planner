import {createNestedSelectorFunctions} from "../../lib/createNestedSelectorFunctions"
import create from "zustand"
import {Seed} from "../../models/Seed"
import {Crop} from "../../models/Crop"
import {Cross} from "../../models/Cross"
import {initializeDb} from "./initializeDb"
import {GardenPatch} from "../../models/GardenPatch"
import {findCrossCandidates} from "./findCrossCandidates"
import {Topsoil, TopsoilGrade, TopsoilId, TopsoilType} from "../../models/Topsoil"

export interface SeedDb {
    seeds: {
        ids: number[],
        byId: Record<number, Seed>
    }

    crops: {
        ids: number[],
        byId: Record<number, Crop>
    }

    crosses: {
        ids: number[],
        byId: Record<number, Cross>
        indexBySeed: Record<number, number[]>
        indexByProduces: Record<number, number[]>
        indexByPair: Record<string, number[]>
    }

    topsoils: {
        ids: TopsoilId[],
        byId: Record<TopsoilId, Topsoil>
    }
}

export enum SeedSearchFindBy {
    SEED_NAME = 'SEED_NAME',
    CROP_NAME = 'CROP_NAME',
    PRODUCED_BY = 'PRODUCED_BY',
    PRODUCES = 'PRODUCES'
}

export interface SeedSearchFilter {
    query: string,
    findBy: SeedSearchFindBy[]
}

export interface ISeedStore extends SeedDb {
    isReady: boolean,

    initialize: () => Promise<void>,

    findSeeds: (filter: SeedSearchFilter) => Seed[],

    findCrossesByPair: (pair: [ number, number ]) => Cross[],

    findCrossCandidates: (patch: GardenPatch, seedIndex: number) => Cross[],

    getTopsoilByTypeAndGrade: (type: TopsoilType, grade: TopsoilGrade) => Topsoil
}

export const useSeedStore = createNestedSelectorFunctions(create<ISeedStore>((set, get) => ({
    isReady: false,

    ...createSeedDb(),

    initialize: async () => {
        const db = await initializeDb()
        set({
            isReady: true,
            ...db
        });
    },

    findSeeds: filter => {
        const seedsById = get().seeds.byId;
        const crossesById = get().crosses.byId;
        const findBy = filter.findBy;
        return get().seeds.ids
            .filter(seedId => {
                const seed = seedsById[seedId]
                const crop = get().crops.byId[seed.cropId]
                const crossesProduced = get().crosses.indexByProduces[seedId]
                const crossesProducedBy = get().crosses.indexBySeed[seedId]

                const namesToMatch = []
                if (findBy.includes(SeedSearchFindBy.SEED_NAME)) {
                    namesToMatch.push(seed.name)
                }

                if (findBy.includes(SeedSearchFindBy.CROP_NAME)) {
                    namesToMatch.push(crop.name)
                }

                if (findBy.includes(SeedSearchFindBy.PRODUCES) && crossesProduced) {
                    for (const crossProduced of crossesProduced) {
                        namesToMatch.push(seedsById[crossesById[crossProduced].seeds[0]].name)
                        namesToMatch.push(seedsById[crossesById[crossProduced].seeds[1]].name)
                    }
                }

                if (findBy.includes(SeedSearchFindBy.PRODUCED_BY) && crossesProducedBy) {
                    for (const crossProducedBy of crossesProducedBy) {
                        namesToMatch.push(seedsById[crossesById[crossProducedBy].produces].name)
                    }
                }

                return namesToMatch
                    .some(name => name.toLowerCase()
                        .includes(filter.query.toLowerCase()))
            })
            .map(seedId => seedsById[seedId])
    },

    findCrossesByPair: pair => {
        const crossIds = get().crosses.indexByPair[makePairString(pair[0], pair[1])]
        if (!crossIds) return []

        return crossIds.map(crossId => get().crosses.byId[crossId])
    },

    findCrossCandidates: (patch, seedIndex) => {
        return findCrossCandidates(get(), patch, seedIndex)
    },

    getTopsoilByTypeAndGrade: (type, grade) => {
        const topsoilsById = get().topsoils.byId
        const topsoilId = get().topsoils.ids.find(topsoilId => {
            const topsoil = topsoilsById[topsoilId];
            return topsoil.type === type && topsoil.grade === grade;
        });
        if (!topsoilId) {
            throw new Error(`Could not find topsoil with type ${type} and grade ${grade}.`)
        }

        return topsoilsById[topsoilId];
    }
})))

export function createSeedDb(): SeedDb {
    return {
        seeds: {
            ids: [],
            byId: {}
        },

        crops: {
            ids: [],
            byId: {}
        },

        crosses: {
            ids: [],
            byId: {},
            indexBySeed: {},
            indexByProduces: {},
            indexByPair: {}
        },

        topsoils: {
            ids: [],
            byId: {}
        }
    }
}

export function makePairString(left: number, right: number) {
    return [ left, right ]
        .sort((a, b) => a - b)
        .map(n => n.toString())
        .join(',')
}

