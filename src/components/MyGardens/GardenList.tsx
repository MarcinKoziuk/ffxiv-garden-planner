import React from "react"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {GardenPane} from "./GardenPane"
import {Button, Buttons} from "../Button/buttons"
import {AddOne} from "@icon-park/react"
import "./GardenList.css"

export const GardenList = React.memo(() => {
    const gardenStore = useGardenPlannerStore.use.gardens();

    return (
        <div className="garden-list">
            { gardenStore.ids.map(id => (
                <GardenPane key={id} garden={gardenStore.byId[id]} />
            ))}

            { gardenStore.ids.length <= 0 && (
                <p>
                    You have no gardens yet.
                </p>
            )}

            <Buttons>
                <Button className={gardenStore.ids.length === 0 ? 'primary' : 'outline-primary'}
                        to="./new"
                        icon={<AddOne />}>
                    Add new garden
                </Button>
            </Buttons>
        </div>
    )
})
