import {Garden, getPatchIndices} from "../../models/Garden"
import React, {FC} from "react"
import {ButtonIcon, ButtonIcons} from "../Button/buttons"
import {EditTwo, Delete} from "@icon-park/react";
import {GardenPatchCell} from "./GardenPatchCell"
import classNames from "classnames"
import "./GardenPane.css"

interface Props {
    garden: Garden
}

export const GardenPane: FC<Props> = ({ garden }) => {
    const patchIndices = getPatchIndices(garden)

    return (
        <div className={classNames([
            'pane', 'garden-pane', `n-${garden.houseSize}`
        ])}>
            <div className="pane-header">
                <div className="pane-title">
                    {garden.name}
                </div>
                <div className="pane-actions">
                    <ButtonIcons>
                        <ButtonIcon icon={<EditTwo />}
                                    className="default"
                                    to={`/gardens/${garden.id}/edit`}
                                    title="Edit garden" />
                        <ButtonIcon icon={<Delete />}
                                    className="danger"
                                    to={`/gardens/${garden.id}/remove`}
                                    title="Remove garden" />
                    </ButtonIcons>
                </div>
            </div>
            <div className="pane-section garden-grid">
                { patchIndices.map(i => (
                    <GardenPatchCell key={i}
                                     garden={garden}
                                     patchIndex={i}
                                     patch={garden.patches[i] ?? null} />
                ))}
            </div>
        </div>
    )
}

