import {Crop} from "../../models/Crop"
import {Seed, SeedCategory, Yield} from "../../models/Seed"
import {Cross} from "../../models/Cross"
import {Topsoil, TopsoilGrade, TopsoilId, TopsoilType} from "../../models/Topsoil"
import {createSeedDb, makePairString, SeedDb} from "./useSeedStore"

export async function initializeDb(): Promise<SeedDb> {
    const db = createSeedDb();
    const [
        xivDbCrops,
        xivDbSeeds,
        xivDbTopsoils,
        ffxivGardeningSeeds,
        ffxivGardeningCrosses
    ]: [
        any,
        any,
        any,
        any,
        any
    ] = await Promise.all([
        import('../../db/XIVDB_crops.json'),
        import('../../db/XIVDB_seeds.json'),
        import('../../db/XIVDB_topsoils.json'),
        import('../../db/FFXIVGardening_seeds.json'),
        import('../../db/FFXIVGardening_crosses.json'),
    ]);

    const ffxivGardeningIdToId: Record<number, number> = {}

    for (const xivDbTopsoil of xivDbTopsoils.default) {
        const topsoilId = xivDbTopsoil.ID as TopsoilId;
        const topsoilName = xivDbTopsoil.Name as string;
        const topsoilType = getTopsoilType(topsoilName);
        const topsoilGrade = getTopsoilGrade(topsoilName);
        const topsoil: Topsoil = {
            id: topsoilId,
            type: topsoilType,
            grade: topsoilGrade,
            name: topsoilName,
            xivDbIcon: localIcon(xivDbTopsoil.Icon as string),
            xivDbIconHD: localIcon(xivDbTopsoil.IconHD as string),
            item: xivDbTopsoil
        }

        db.topsoils.ids.push(topsoilId);
        db.topsoils.byId[topsoilId] = topsoil;
    }

    for (const xivDbCrop of xivDbCrops.default) {
        const cropId = xivDbCrop.ID as number;
        const cropName = xivDbCrop.Item.Name as string;
        const seedId = xivDbCrop.GameContentLinks.Item.AdditionalData[0] as number;
        const crop: Crop = {
            id: cropId,
            seedId,
            name: cropName,
            xivDbIcon: localIcon(xivDbCrop.Item.Icon as string),
            xivDbIconHD: localIcon(xivDbCrop.Item.IconHD as string),
            xivDbIconAlt: localIcon(xivDbCrop.Icon as string),
            item: xivDbCrop.Item
        };

        db.crops.ids.push(cropId);
        db.crops.byId[cropId] = crop;

        const xivDbSeed = xivDbSeeds.default.find((s: any) => s.ID === seedId);
        if (!xivDbSeed) {
            throw new Error(`Seed ID ${seedId} not found in XIVDB seeds json`);
        }

        const seedName = xivDbSeed.Name as string;

        const ffxivGardeningSeed = ffxivGardeningSeeds.default.find((s: any) => {
            return s.name === seedName
                || s.name === cropName
                || (`${s.name}s` === cropName) // Plural Lowland Grape(s)
                || s.name === seedName.replace(/(Seeds)|(Sapling)|(Bulbs)|(Pips)/, '').trim()
                || (s.name === 'Olive' && cropName === 'Cinderfoot Olive');
        });
        if (!ffxivGardeningSeed) {
            throw new Error(`Seed ${seedName} not found in FFXIV gardening json`);
        }

        const ffxivGardeningId = ffxivGardeningSeed.ffxivGardeningId as number;

        const seed: Seed = {
            id: seedId,
            cropId,
            name: seedName,
            category: ffxivGardeningSeed.category as SeedCategory,
            ffxivGardeningId,
            xivDbIcon: localIcon(xivDbSeed.Icon as string),
            xivDbIconHD: localIcon(xivDbSeed.IconHD as string),
            cropYield: ffxivGardeningSeed.cropYield as Yield,
            seedYield: ffxivGardeningSeed.seedYield as Yield,
            growTime: ffxivGardeningSeed.growTime as number,
            wiltTime: ffxivGardeningSeed.wiltTime as number,
            item: xivDbSeed
        };

        db.seeds.ids.push(seedId);
        db.seeds.byId[seedId] = seed;
        ffxivGardeningIdToId[ffxivGardeningId] = seedId;
    }

    let crossIdSequence = 1;
    for (const ffxivGardeningCross of ffxivGardeningCrosses.default) {
        const seedLeftFId = ffxivGardeningCross.pairs[0] as number;
        const seedRightFId = ffxivGardeningCross.pairs[1] as number;
        const producesFId = ffxivGardeningCross.produces as number;

        const seedLeftId = ffxivGardeningIdToId[seedLeftFId]
        const seedRightId = ffxivGardeningIdToId[seedRightFId]
        const producesId = ffxivGardeningIdToId[producesFId]

        const seedLeft = db.seeds.byId[seedLeftId];
        const seedRight = db.seeds.byId[seedRightId];
        const produces = db.seeds.byId[producesId];

        const crossId = crossIdSequence++;
        const cross: Cross = {
            id: crossId,
            seeds: [seedLeft.id, seedRight.id],
            produces: produces.id
        };

        db.crosses.ids.push(crossId);
        db.crosses.byId[crossId] = cross;

        if (!(produces.id in db.crosses.indexByProduces)) {
            db.crosses.indexByProduces[produces.id] = [];
        }
        db.crosses.indexByProduces[produces.id].push(crossId);

        if (!(seedLeft.id in db.crosses.indexBySeed)) {
            db.crosses.indexBySeed[seedLeft.id] = [];
        }
        if (!(seedRight.id in db.crosses.indexBySeed)) {
            db.crosses.indexBySeed[seedRight.id] = [];
        }
        db.crosses.indexBySeed[seedLeft.id].push(crossId);
        db.crosses.indexBySeed[seedRight.id].push(crossId);

        const pairString = makePairString(seedLeft.id, seedRight.id);
        if (!(pairString in db.crosses.indexByPair)) {
            db.crosses.indexByPair[pairString] = [];
        }
        db.crosses.indexByPair[pairString].push(crossId);
    }

    return db;
}

function localIcon(origIconPath: string): string {
    const m = origIconPath.match(/^\/i\/.+\/(.*)/)
    if (m && m.length >= 1) {
        return '/icons/items/' + m[1]
    } else {
        throw new Error(`Bad icon ${origIconPath}`)
    }
}

function getTopsoilType(name: string): TopsoilType {
    if (name.includes('La Noscean')) return TopsoilType.LaNoscean;
    else if (name.includes('Thanalan')) return TopsoilType.Thanalan;
    else if (name.includes('Shroud')) return TopsoilType.Shroud;
    else throw new Error('Strange topsoil? : ' + name);
}

function getTopsoilGrade(name: string): TopsoilGrade {
    const match = name.match(/Grade ([1-3])/);
    if (!match) throw new Error('Strange topsoil? : ' + name);

    return parseInt(match[1]) as TopsoilGrade;
}