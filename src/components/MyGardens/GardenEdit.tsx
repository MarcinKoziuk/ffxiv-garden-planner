import {useParams} from "react-router-dom"
import {GardenEditForm} from "./GardenEditForm"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {SUUID} from "short-uuid"
import {PageNotFound} from "../Error/PageNotFound"
import React from "react"

export const GardenEdit = () => {
    const { gardenId } = useParams();
    const gardenStore = useGardenPlannerStore.use.gardens();

    if (gardenId) {
        const garden = gardenStore.byId[gardenId as SUUID];
        if (!garden) return <PageNotFound />

        return <GardenEditForm garden={garden} />
    } else {
        return <GardenEditForm />;
    }
}