import {Identifiable} from "./Identifiable"

export enum TopsoilType {
    LaNoscean = 'LaNoscean',
    Thanalan = 'Thanalan',
    Shroud = 'Shroud'
}

export type TopsoilId = number;

export type TopsoilGrade = 1 | 2 | 3;

export interface Topsoil extends Identifiable<TopsoilId> {
    type: TopsoilType
    grade: TopsoilGrade
    name: string
    xivDbIcon: string
    xivDbIconHD: string
    item: any
}
