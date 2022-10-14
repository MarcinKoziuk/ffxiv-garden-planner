export enum GardenPatchType {
    Round = 'Round',
    Oblong = 'Oblong',
    Deluxe = 'Deluxe'
}

export interface GardenPatchTypeInfo {
    label: string
    numberOfBeds: number
}

export const GardenPatchConstants: Record<GardenPatchType, GardenPatchTypeInfo> = {
    Round: {
        label: 'Round',
        numberOfBeds: 4
    },
    Oblong: {
        label: 'Oblong',
        numberOfBeds: 6
    },
    Deluxe: {
        label: 'Deluxe',
        numberOfBeds: 8
    }
};