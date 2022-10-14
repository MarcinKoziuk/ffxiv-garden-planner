import {createContext} from "react";
import {Garden} from "../../models/Garden"
import {SUUID} from "short-uuid"

export interface IGardenPlannerStoreContext {
    getMyGardens: () => Garden[],
    addGarden: (house: Garden) => void,
    updateGarden: (house: Garden) => void,
    removeGarden: (id: SUUID) => void

}

export const GardenPlannerStoreContext = createContext<IGardenPlannerStoreContext | null>(null)
