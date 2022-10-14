import React, {FC, useCallback, useMemo} from "react"
import {IGardenPatchContext} from "./GardenPatchCell"
import {Dialog, DialogProps} from "../Dialog/Dialog"
import {useSeedStore} from "../SeedDb/useSeedStore"
import {GardenPatchConstants} from "../../models/GardenPatchType"
import {SeedRow} from "../SeedChooser/SeedRow"
import {useModal} from "react-modal-hook/dist"
import {SeedChooser} from "../SeedChooser/SeedChooser"
import {Button, ButtonIcon, ButtonIcons} from "../Button/buttons"
import {EditTwo, Erase} from "@icon-park/react"
import "./GardenPatchCellPopup.css"
import {TopsoilRow} from "../TopsoilChooser/TopsoilRow"
import {TopsoilChooser} from "../TopsoilChooser/TopsoilChooser"
import {Topsoil, TopsoilId} from "../../models/Topsoil"
import {Cross, CrossChance} from "../../models/Cross"

interface GardenPatchCellPopupProps extends DialogProps {
    gardenPatchContext: IGardenPatchContext
    seedIndex: number
}

export const GardenPatchCellPopup: FC<GardenPatchCellPopupProps> = ({ seedIndex, gardenPatchContext, ...dialogProps }) => {
    const { garden, patch, patchIndex, setSeed, setTopsoil } = gardenPatchContext
    const seedStore = useSeedStore()

    const crosses = useMemo(() => seedStore.findCrossCandidates(patch, seedIndex),
        [ seedStore, patch, seedIndex ])

    const seedId = patch.seeds[seedIndex]
    const topsoilId = patch.topsoil[seedIndex]

    const topsoil = topsoilId ? seedStore.topsoils.byId[topsoilId] : null
    const defaultTopsoil = garden.defaultTopsoil ? seedStore.topsoils.byId[garden.defaultTopsoil] : null

    const handleClearBed = useCallback(() => {
        setSeed(patchIndex, seedIndex, null)
        setTopsoil(patchIndex, seedIndex, null)
    }, [ patchIndex, seedIndex, setSeed, setTopsoil ])
    
    const handleChooseDefaultTopsoil = useCallback(() => {
        if (defaultTopsoil)
            setTopsoil(patchIndex, seedIndex, defaultTopsoil.id)
    }, [ defaultTopsoil, patchIndex, seedIndex, setTopsoil ])
    
    const handleChooseSeed = useCallback((seedId: number | null) => {
        setSeed(patchIndex, seedIndex, seedId)
    }, [ patchIndex, seedIndex, setSeed ])
    
    const [ openSeedChooserDialog, closeSeedChooserDialog ] = useModal(() => (
        <SeedChooser isOpen
                     seedId={seedId ?? undefined}
                     onChoose={handleChooseSeed}
                     onDismiss={closeSeedChooserDialog} />
    ), [ setSeed ])

    const handleChooseTopsoil = useCallback((topsoilId: TopsoilId | null) => {
        setTopsoil(patchIndex, seedIndex, topsoilId)
    }, [ patchIndex, seedIndex, setTopsoil ])

    const [ openTopsoilChooserDialog, closeTopsoilChooserDialog ] = useModal(() => (
        <TopsoilChooser isOpen
                     topsoilId={topsoilId ?? undefined}
                     onChoose={handleChooseTopsoil}
                     onDismiss={closeTopsoilChooserDialog} />
    ), [ setSeed ])


    const title = `${GardenPatchConstants[patch.type].label} garden patch, bed ${seedIndex + 1}`
    
    return (
        <Dialog title={title}
                className="garden-patch-cell-popup"
                extraActions={
                    <>
                        <ButtonIcon icon={<Erase />}
                                    className="primary"
                                    onClick={handleClearBed}>
                            Reset
                        </ButtonIcon>
                    </>
                }
                {...dialogProps}>
            <div className="dialog-body-section">
                <label>Seed</label>
                { seedId ? (
                    <div className="seed-list">
                        <SeedRow seedId={seedId} actions={(
                            <ButtonIcons>
                                <ButtonIcon icon={<EditTwo />} className="default" onClick={openSeedChooserDialog} />
                            </ButtonIcons>
                        )} />
                    </div>
                ) : (
                    <div className="choose-button-wrapper">
                        <Button className="outline-default" onClick={openSeedChooserDialog}>
                            Choose seed...
                        </Button>
                    </div>
                )}
            </div>
            <div className="dialog-body-section">
                <label>Topsoil</label>
                { topsoilId ? (
                    <div className="seed-list">
                        <TopsoilRow topsoilId={topsoilId} actions={(
                            <ButtonIcons>
                                <ButtonIcon icon={<EditTwo />} className="default" onClick={openTopsoilChooserDialog} />
                            </ButtonIcons>
                        )} />
                    </div>
                ) : (
                    <div className="choose-button-wrapper">
                        <Button className="outline-default" onClick={openTopsoilChooserDialog}>
                            Choose topsoil...
                        </Button>
                        { defaultTopsoil && (
                            <Button className="outline-primary" onClick={handleChooseDefaultTopsoil}>
                                Choose {defaultTopsoil.name}
                            </Button>
                        )}
                    </div>
                )}
            </div>
            { crosses.length > 0 && (
                <div className="dialog-body-section">
                    <label>Potential crosses</label>
                    <div className="seed-list">
                        {crosses.map(cross => (
                            <SeedRow key={cross.id} seedId={cross.produces}>
                                <div className="seed-info" style={{ flexShrink: 1, textAlign: 'right' }}>
                                    {getCrossChance(cross, crosses.length, topsoil).toFixed(0)}%
                                </div>
                            </SeedRow>
                        ))}
                    </div>
                </div>
            )}
        </Dialog>
    )
}

function getCrossChance(cross: Cross, numberOfCrosses: number, topsoil: Topsoil | null): number {
    if (!topsoil) return 0;
    return CrossChance[topsoil.type][topsoil.grade - 1] / numberOfCrosses;
}
