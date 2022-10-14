import {Identifiable} from "./Identifiable"

export enum SeedCategory {
    Fruit = 'Fruit',
    DeluxeFruit = 'DeluxeFruit',
    Vegetable = 'Vegetable',
    DeluxeVegetable = 'DeluxeVegetable',
    HerbAndNut = 'HerbAndNut',
    DeluxeHerbAndNut = 'DeluxeHerbAndNut',
    ChocoboFood = 'ChocoboFood',
    Minion = 'Minion',
    Elemental = 'Elemental',
    Flowerpot = 'Flowerpot'
}

// Synced with FFXIV Gardening names
export const SeedCategoryLabels: Record<SeedCategory, string> = {
    Fruit: 'Fruit',
    DeluxeFruit: 'Deluxe Fruit',
    Vegetable: 'Vegetable',
    DeluxeVegetable: 'Deluxe Vegetable',
    HerbAndNut: 'Herb & Nut',
    DeluxeHerbAndNut: 'Deluxe Herb & Nut',
    ChocoboFood: 'Chocobo Food',
    Minion: 'Minion',
    Elemental: 'Elemental',
    Flowerpot: 'Flowerpot'
}

export type Yield = [ number, number, number, number ];

export interface Seed extends Identifiable<number> {
    cropId: number,
    category: SeedCategory,
    name: string,
    xivDbIcon: string,
    xivDbIconHD: string,
    ffxivGardeningId: number,
    cropYield: Yield,
    seedYield: Yield,
    growTime: number,
    wiltTime: number | null,
    item: Object
}

