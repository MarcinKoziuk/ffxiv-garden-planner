import {Identifiable} from "./Identifiable"

export interface Crop extends Identifiable<number> {
    seedId: number,
    name: string,
    xivDbIcon: string,
    xivDbIconHD: string,
    xivDbIconAlt: string
    item: Object
}
