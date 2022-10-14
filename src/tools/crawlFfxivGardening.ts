import {getData} from "../lib/ajax";
import {SeedCategory, SeedCategoryLabels} from "../models/Seed";
import {sleep} from "./crawlHelpers";


function toNumberWithRegex(str: string, regexp: RegExp) {
    const m = str.match(regexp);
    if (m && m[1] != null) {
        return parseInt(m[1], 10);
    } else {
        throw new Error(`Could not parse number from ${str} with ${regexp}`);
    }
}

function toSeedType(str: string): SeedCategory {
    const idx = Object.values(SeedCategoryLabels).indexOf(str);
    if (idx !== -1) {
        return Object.keys(SeedCategoryLabels)[idx] as SeedCategory;
    } else {
        throw new Error(`Could not convert seed type ${str}`);
    }
}


function grabMainDivInfo(mainDiv: Element, fieldName: string) {
    const strongNode = Array.from(mainDiv.querySelectorAll('strong'))
        .find(node => {
            return node.innerText.trim() === fieldName + ":";
        });
    if (!strongNode || !strongNode.parentNode) {
        throw new Error(`Could not grab main div info for ${fieldName}`);
    }

    return (strongNode.parentNode as HTMLElement).innerText.replace(`${fieldName}: `, '').trim();
}

export async function crawlFfxivGardening() {
    const seeds = [];
    const crosses = [];

    const seedListHtml = await getData('https://www.ffxivgardening.com/seed-list') as string;

    const parser = new DOMParser();
    const seedListDoc = parser.parseFromString(seedListHtml, 'text/html');
    const table = seedListDoc.getElementById('myTable');
    if (!table) throw new Error('Main table not found');

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (!cells || cells.length !== 8) {
            throw new Error('Unexpected cell length');
        }

        const seedId = toNumberWithRegex(cells[1].innerHTML, /SeedID=([0-9]+)/);
        const seedName = cells[1].innerText;
        const seedCategory = toSeedType(cells[2].innerText);

        const growTimeUnit = cells[3].innerText.includes('Days') ? 1 : (1/24);
        const growTimeNumber = toNumberWithRegex(cells[3].innerText, /([0-9]+)/);
        const growTime = growTimeUnit * growTimeNumber;

        const wiltCellTxt = cells[4].innerText.trim();
        const wiltTime = wiltCellTxt !== '--' ? toNumberWithRegex(cells[4].innerText, /([0-9]+)/) : null;

        const seedPageHtml = await getData('https://www.ffxivgardening.com/seed-details.php', {
            params: {
                SeedID: seedId
            }
        }) as string;
        const seedPageDoc = parser.parseFromString(seedPageHtml, 'text/html');
        const mainDiv = seedPageDoc.getElementsByClassName('blog-main')[0];
        console.log(`Crawling seed ${seedId}`);
        if (!mainDiv) {
            console.error(seedPageHtml, seedPageDoc);
            throw new Error('Main div element not found');
        }

        const cropYield = grabMainDivInfo(mainDiv, 'Crop Yield')
            .split('/')
            .map(v => v.trim())
            .map(v => parseInt(v, 10));
        const seedYield = grabMainDivInfo(mainDiv, 'Seed Yield')
            .split('/')
            .map(v => v.trim())
            .map(v => parseInt(v, 10));

        const crossTable = seedPageDoc.getElementById('myTable');
        if (crossTable) {
            const crossRows = Array.from(crossTable.querySelectorAll('tbody tr'));
            for (const crossRow of crossRows) {
                const crossCells = Array.from(crossRow.querySelectorAll('td'));
                if (!crossCells || crossCells.length < 6) {
                    throw new Error('Bad cross cells');
                }

                const seedIdLeft = toNumberWithRegex(crossCells[1].innerHTML, /SeedID=([0-9]+)/);
                const seedIdRight = toNumberWithRegex(crossCells[5].innerHTML, /SeedID=([0-9]+)/);
                const cross = {
                    produces: seedId,
                    pairs: [ seedIdLeft, seedIdRight ]
                };
                crosses.push(cross);
            }
        }

        seeds.push({
            category: seedCategory,
            name: seedName,
            ffxivGardeningId: seedId,
            growTime,
            wiltTime,
            seedYield,
            cropYield
        });

        await sleep(500);
    }


    console.log({ seeds, crosses });

    // @ts-ignore
    window.seeds = seeds;
    // @ts-ignore
    window.crosses = crosses;
}