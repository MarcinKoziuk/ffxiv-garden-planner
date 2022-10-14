import {Identifiable} from "./Identifiable"
import {TopsoilType} from "./Topsoil"

export interface Cross extends Identifiable<number> {
    seeds: [ number, number ],
    produces: number
}

export const CrossChance = {
    [TopsoilType.Thanalan]: [ 50, 70, 89 ],
    [TopsoilType.Shroud]: [ 5, 5, 5 ],
    [TopsoilType.LaNoscean]: [ 5, 5, 5 ]
}
