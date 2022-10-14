import create from "zustand";
import {Garden} from "../../models/Garden"
import {createEntityRepository, EntityRepository} from "../../lib/createEntityRepository"
import {persist} from "zustand/middleware"
import {createNestedSelectorFunctions} from "../../lib/createNestedSelectorFunctions"
import {SUUID} from "short-uuid"

export type IGardenPlannerStore = {
    gardens: EntityRepository<Garden, SUUID>
}

export const useGardenPlannerStore = createNestedSelectorFunctions(
    create<IGardenPlannerStore>(
        persist((set, get) => ({
            gardens: createEntityRepository<Garden, SUUID, IGardenPlannerStore, 'gardens'>('gardens', set, get)
        }), {
            name: 'ffxiv-garden-planner-store-v1',
            merge: (persistedState, currentState) => {
                const store = { ...currentState };
                Object.entries(currentState).forEach(([k, subStore]) => {
                    const storeKey = k as keyof IGardenPlannerStore;
                    store[storeKey] = Object.assign({}, subStore, persistedState[k]);
                });

                return store;
            }
        })
    ))
