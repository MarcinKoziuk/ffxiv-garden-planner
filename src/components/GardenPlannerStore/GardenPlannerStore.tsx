import React, {FC, ReactNode, useCallback} from "react"
import {useLocalStorage} from "usehooks-ts"
import {Garden} from "../../models/Garden"
import {GardenPlannerStoreContext} from "./GardenPlannerStoreContext";
import produce from "immer"
import {SUUID} from "short-uuid"
import { WritableDraft } from "immer/dist/internal";

const CUR_PROFILE_VERSION = 1;
const CUR_PROFILE_COMPAT_VERSION = 1;

interface GardenLocalProfile {
    version: number,
    compatVersion: number,
    created: number,
    updated: number | null,
    gardens: Garden[]
}

interface Props {
    children: ReactNode
}

export const GardenPlannerStore: FC<Props> = ({children}) => {
    const [profile_, setProfile] = useLocalStorage<GardenLocalProfile>('garden-planner-v1', {
        version: CUR_PROFILE_VERSION,
        compatVersion: CUR_PROFILE_COMPAT_VERSION,
        created: Date.now(),
        updated: null,
        gardens: []
    });
    const profile = profile_;

    const mutateProfile = useCallback((cb: (draft: WritableDraft<GardenLocalProfile>) => void) => {
        setProfile(produce(draft => {
            cb(draft);
            draft.updated = Date.now();
        }))
    }, [ setProfile ]);

    const getMyGardens = useCallback(() => {
        return profile.gardens;
    }, [ profile.gardens ]);

    const updateGarden = useCallback((house: Garden) => {
        mutateProfile(draft => {
            const index = draft.gardens.findIndex(h => h.id === house.id);
            if (index === -1) {
                throw new Error(`House with id ${house.id} does not exist.`);
            } else {
                draft.gardens[index] = house;
            }
        });
    }, [ mutateProfile ]);

    const addGarden = useCallback((house: Garden) => {
        mutateProfile(draft => {
            draft.gardens.push(house);
        });
    }, [ mutateProfile ]);

    const removeGarden = useCallback((id: SUUID) => {
        mutateProfile(draft => {
            draft.gardens = draft.gardens.filter(h => h.id !== id);
        });
    }, [ mutateProfile ]);

    return (
        <GardenPlannerStoreContext.Provider value={{
            getMyGardens,
            addGarden,
            updateGarden,
            removeGarden
        }}>
            {children}
        </GardenPlannerStoreContext.Provider>
    )
}