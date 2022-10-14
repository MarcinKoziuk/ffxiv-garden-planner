import {IGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {SUUID} from "short-uuid"
import {ISeedStore} from "../SeedDb/useSeedStore"
import {CrossChance} from "../../models/Cross"
import {Topsoil, TopsoilType} from "../../models/Topsoil"
import {Yield} from "../../models/Seed"

export type D = {
    name: string
    id: number
    vDay: number
    vWeek: number
    vMonth: number
}

export type PredictionResult = {
    used: D[],
    crossbred: D[],
    balance: D[],
    cropYield: D[]
}

function getYieldForTopsoil(topsoil: Topsoil, cropYield: Yield) {
    switch (topsoil.type) {
        case TopsoilType.LaNoscean:
            return cropYield[0];
        case TopsoilType.Thanalan:
            return cropYield[0];
        case TopsoilType.Shroud:
            return cropYield[topsoil.grade];
    }
    return 0;
}

export function calculateCrossbreedPrediction(seedStore: ISeedStore, gardenStore: IGardenPlannerStore, gardenIds?: SUUID[]): PredictionResult {
    const consumedDailyBySeedId: Record<number, number> = {}
    const producedDailyBySeedId: Record<number, number> = {}
    const yieldByCropId: Record<number, number> = {}

    if (!gardenIds) {
        gardenIds = gardenStore.gardens.ids;
    }

    for (const gardenId of gardenIds) {
        const garden = gardenStore.gardens.byId[gardenId];
        for (const patch of garden.patches) {
            for (let seedIndex = 0; seedIndex < 8; seedIndex++) {
                const seedId = patch.seeds[seedIndex];
                const topsoilId = patch.topsoil[seedIndex];
                if (seedId == null) continue;

                const seed = seedStore.seeds.byId[seedId];
                if (!seed) {
                    console.error("wat", seedId)
                    console.log("sid", seedStore.seeds.byId);

                    throw new Error('bad seed ' + seedId);

                }

                const topsoil = topsoilId != null ? seedStore.topsoils.byId[topsoilId] : null;
                const crosses = seedStore.findCrossCandidates(patch, seedIndex);

                const topsoilCrossChance = topsoil ? CrossChance[topsoil.type][topsoil.grade - 1] / 100.0 : 0.0;

                const days = Math.ceil(seed.growTime);
                
               // console.log("seed", seed)
                for (let cross of crosses) {
                    const produceAmount = (1 / crosses.length / days) * topsoilCrossChance;  // grade 3 thanalan
                    if (!(cross.produces in producedDailyBySeedId)) {
                        producedDailyBySeedId[cross.produces] = 0;
                    }
                    producedDailyBySeedId[cross.produces] += produceAmount;
                }

                const yieldAmount = topsoil ?
                    (1 / days) * getYieldForTopsoil(topsoil, seed.cropYield)
                    : 0;
                if (!(seed.cropId in yieldByCropId)) {
                    yieldByCropId[seed.cropId] = 0;
                }
                yieldByCropId[seed.cropId] += yieldAmount;

                const requireAmount = 1 / days;
                if (!(seedId in consumedDailyBySeedId)) {
                    consumedDailyBySeedId[seedId] = 0;
                }
                consumedDailyBySeedId[seedId] += requireAmount;
            }
        }
    }

    const used: D[] = [];
    const crossbred: D[] = [];
    const balance: D[] = [];
    const cropYield: D[] = [];

    for (const [ seedIdStr, value ] of Object.entries(consumedDailyBySeedId)) {
        const seedId = parseInt(seedIdStr);
        used.push({
            name: seedStore.seeds.byId[seedId].name,
            id: seedId,
            vDay: value,
            vWeek: value * 7,
            vMonth: value * 30
        })
    }

    for (const [ seedIdStr, value ] of Object.entries(producedDailyBySeedId)) {
        const seedId = parseInt(seedIdStr)
        crossbred.push({
            name: seedStore.seeds.byId[seedId].name,
            id: seedId,
            vDay: value,
            vWeek: value * 7,
            vMonth: value * 30
        })
    }

    const allKeys = new Set([ ...Object.keys(consumedDailyBySeedId), ...Object.keys(producedDailyBySeedId) ])
    // @ts-ignore
    for (const seedIdStr of allKeys) {
        const seedId = parseInt(seedIdStr)
        const consumedValue = consumedDailyBySeedId[seedId] || 0;
        const producedValue = producedDailyBySeedId[seedId] || 0;
        const value = producedValue - consumedValue;
        balance.push({
            name: seedStore.seeds.byId[seedId].name,
            id: seedId,
            vDay: value,
            vWeek: value * 7,
            vMonth: value * 30
        })
    }

    for (const [ cropIdStr, value ] of Object.entries(yieldByCropId)) {
        const cropId = parseInt(cropIdStr)
        cropYield.push({
            name: seedStore.crops.byId[cropId].name,
            id: cropId,
            vDay: value,
            vWeek: value * 7,
            vMonth: value * 30
        })
    }

    return {
        used,
        crossbred,
        balance,
        cropYield
    }
}