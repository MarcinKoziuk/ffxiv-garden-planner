import {useNavigate, useParams} from "react-router-dom"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {SUUID} from "short-uuid"
import {PageNotFound} from "../Error/PageNotFound"
import React from "react"
import {Button, Buttons} from "../Button/buttons"
import {Delete} from "@icon-park/react"

export const GardenRemove = () => {
    const {gardenId} = useParams();
    const navigate = useNavigate();

    const gardenStore = useGardenPlannerStore.use.gardens();
    const garden = gardenStore.byId[gardenId as SUUID];
    if (!garden) return <PageNotFound/>

    return (
        <div className="content">
            <p>
                Are you sure you want to remove garden '{garden.name}'?
            </p>
            <Buttons>
                <Button className="outline-primary"
                        to="..">
                    Cancel
                </Button>
                <Button
                    icon={<Delete />}
                    className="outline-danger"
                    onClick={() => {
                        gardenStore.removeOne(gardenId as SUUID);
                        navigate("/gardens");
                    }}>
                    Remove garden permanently
                </Button>
            </Buttons>
        </div>
    )
}