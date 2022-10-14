import {getData} from "../lib/ajax";
import {sleep} from "./crawlHelpers";

interface XivDbPagination {
    Page: number,
    PageNext: number | null
}

interface XivDbContentPage {
    Pagination: XivDbPagination,
    Results: any[]
}

async function doCrawlPages(endpointFunction: (page: number) => Promise<XivDbContentPage>,
							delay: number,
							curPage: number,
							results: any[]
) : Promise<any[]> {
    const pageResult: XivDbContentPage = await endpointFunction(curPage);

    const allResults = [...results, ...pageResult.Results];
    if (pageResult.Pagination.PageNext != null) {
        await sleep(delay);
        return doCrawlPages(endpointFunction, delay, curPage + 1, allResults)
    } else {
        return allResults;
    }
}

async function crawlPages(endpointFunction: (page: number) => Promise<XivDbContentPage>, delay: number): Promise<any[]> {
    return doCrawlPages(endpointFunction, delay, 1, [])
}

export async function crawlXivdb() {
    const cropSynopsises = await crawlPages(
    	page => getData('https://xivapi.com/GardeningSeed', {
    		params: {
    			page,
				limit: 1000
			}
		}) as Promise<XivDbContentPage>,
		1000
	);
    const crops = [];
    const seeds = [];
    for (const cropSynopsis of cropSynopsises) {
        const crop = await getData(`https://xivapi.com/GardeningSeed/${cropSynopsis.ID}`) as any;
        crops.push(crop);


        const seedId = crop.GameContentLinks.Item.AdditionalData[0];
        const seed = await getData(`https://xivapi.com/Item/${seedId}`) as any;
        seeds.push(seed);

        await sleep(200);
    }

    const topsoilSynopsises = await getData(`https://xivapi.com/search`, {
        params: {
            'string': 'topsoil'
        }
    }) as XivDbContentPage
    const topsoils = [];
    for (const topsoilSynopsis of topsoilSynopsises.Results) {
        const topsoilId = topsoilSynopsis.ID;
        const topsoil = await getData(`https://xivapi.com/Item/${topsoilId}`) as any;
        topsoils.push(topsoil);
    }

    console.log({ crops, seeds, topsoils });

    // @ts-ignore
    window.crops = crops;
    // @ts-ignore
    window.seeds = seeds;
    // @ts-ignore
    window.topsoils = topsoils;

    return [ crops, seeds, topsoils ];
}
