import {GardenPatch} from "../../models/GardenPatch"
import React, {createContext, FC, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Garden} from "../../models/Garden"
import produce from "immer"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {GardenPatchType} from "../../models/GardenPatchType"
import {useRequiredContext} from "../../lib/useRequiredContext"
import {useSeedStore} from "../SeedDb/useSeedStore"
import "./GardenPatchCell.css"
import {useModal} from "react-modal-hook/dist"
import {SeedChooser} from "../SeedChooser/SeedChooser"
import classNames from "classnames"
import {Cross} from "../../models/Cross"
import {GardenPatchCellPopup} from "./GardenPatchCellPopup"
import {Topsoil, TopsoilId} from "../../models/Topsoil"
import {TopsoilChooser} from "../TopsoilChooser/TopsoilChooser"

export interface IGardenPatchContext {
    garden: Garden
    patch: GardenPatch
    patchIndex: number

    setSeed: (patchIndex: number, seedIndex: number, seedId: number | null) => void
    setTopsoil: (patchIndex: number, seedIndex: number, topsoilId: TopsoilId | null) => void
}

export const GardenPatchContext = createContext<IGardenPatchContext | null>(null)

const SeedCell: FC<{ seedIndex: number }> = ({ seedIndex }) => {
    const seedStore = useSeedStore()

    const gardenPatchContext = useRequiredContext(GardenPatchContext)
    const { patch, patchIndex, setSeed, setTopsoil } = gardenPatchContext;
    const seedId = patch.seeds[seedIndex] ?? null
    const seed = seedId ? seedStore.seeds.byId[seedId] : null
    const crop = seed ? seedStore.crops.byId[seed.cropId] : null
    const topsoilId = patch.topsoil[seedIndex] ?? null
    const topsoil = topsoilId ? seedStore.topsoils.byId[topsoilId] : null

    const crosses = useMemo(() => seedStore.findCrossCandidates(patch, seedIndex),
        [ seedStore, patch, seedIndex ])

    const handleChooseSeed = (seedId: number | null) => {
        setSeed(patchIndex, seedIndex, seedId)
    }
    const handleChooseTopsoil = (topsoilId: TopsoilId | null) => {
        setTopsoil(patchIndex, seedIndex, seedId)
    }

    const isInitialEntry = useRef(false);

    const [ openDialog, closeDialog ] = useModal(() => {
        if (isInitialEntry.current) {
            if (!seedId || !!topsoil) {
                return (
                    <SeedChooser isOpen
                                 onChoose={handleChooseSeed}
                                 onDismiss={closeDialog} />
                )
            } else {
                return (
                    <TopsoilChooser isOpen
                                    onChoose={handleChooseTopsoil}
                                    onDismiss={closeDialog} />
                )
            }
        } else {
            return (
                <GardenPatchCellPopup isOpen
                                      gardenPatchContext={gardenPatchContext}
                                      seedIndex={seedIndex}
                                      onDismiss={closeDialog}/>
            )
        }
    }, [ setSeed ])

    const handleOpenDialog = useCallback(() => {
        isInitialEntry.current = !seedId;
        openDialog()
    }, [ openDialog, seedId ])
    
    return (
        <div className="seed">
            { (crosses.length > 0) && (
                <CrossMiniIcons crosses={crosses} />
            )}
            { topsoil && (
                <TopsoilMiniIcon topsoil={topsoil} />
            )}

            <button onClick={handleOpenDialog}
                    className={classNames({
                        'seed-button': true,
                        'with-image': !!crop?.xivDbIconHD
                    })}
                    style={{
                        backgroundImage: `url(${crop?.xivDbIconHD})`
                    }}>
                {/*crop?.name*/}
            </button>
        </div>
    )
}

const CrossMiniIcons: FC<{
    crosses: Cross[]
}> = ({ crosses }) => {
    const seedStore = useSeedStore()
    return (
        <div className="cell-mini-icons cross-mini-icons">
            { crosses.map(cross => {
                const seed = seedStore.seeds.byId[cross.produces]
                const crop = seedStore.crops.byId[seed.cropId]
                return (
                    <div key={cross.id} className="cell-mini-icon" title={seed.name}>
                        <img alt="" src={crop.xivDbIconHD} />
                    </div>
                )
            })}
        </div>
    )
}

const TopsoilMiniIcon: FC<{
    topsoil: Topsoil
}> = ({ topsoil }) => (
    <div className="cell-mini-icons topsoil-mini-icons">
        <div className="cell-mini-icon" title={topsoil.name}>
            <img alt="" src={topsoil.xivDbIconHD} />
        </div>
    </div>
)

const ScareCrow = () => (
    <div className="seed seed-scarecrow" />
)

const DeluxeGardenPatch = () => (
    <div className="garden-patch-cell garden-patch-deluxe">
        <SeedCell seedIndex={0} />
        <SeedCell seedIndex={1} />
        <SeedCell seedIndex={2} />
        <SeedCell seedIndex={7} />
        <ScareCrow />
        <SeedCell seedIndex={3} />
        <SeedCell seedIndex={6} />
        <SeedCell seedIndex={5} />
        <SeedCell seedIndex={4} />
    </div>
)

const OblongGardenPatch = () => (
    <div className="garden-patch-cell garden-patch-oblong">
        <SeedCell seedIndex={0} />
        <SeedCell seedIndex={1} />
        <SeedCell seedIndex={2} />
        <SeedCell seedIndex={3} />
        <SeedCell seedIndex={4} />
        <SeedCell seedIndex={5} />
    </div>
)

const RoundGardenPatch = () => (
    <div className="garden-patch-cell garden-patch-round">
        <SeedCell seedIndex={0} />
        <SeedCell seedIndex={1} />
        <SeedCell seedIndex={2} />
        <SeedCell seedIndex={3} />
    </div>
)

const GardenPatchSwitch = () => {
    const { patch } = useRequiredContext(GardenPatchContext)
    switch (patch.type) {
        case GardenPatchType.Round:
            return <RoundGardenPatch />
        case GardenPatchType.Oblong:
            return <OblongGardenPatch />
        case GardenPatchType.Deluxe:
            return <DeluxeGardenPatch />
    }
}

interface GardenPatchProps {
    garden: Garden,
    patchIndex: number,
    patch: GardenPatch | null
}

export const GardenPatchCell: FC<GardenPatchProps> = ({ garden, patchIndex, patch }) => {
    const gardenStore = useGardenPlannerStore.use.gardens();
    const isEmpty = patch === null

    const handleSetSeed = useCallback((patchIndex: number, seedIndex: number, seedId: number | null) => {
        gardenStore.updateOne(garden.id, draftGarden => {
            const patch = draftGarden.patches[patchIndex]
            patch.seeds[seedIndex] = seedId

            if (draftGarden.defaultTopsoil && !patch.topsoil[seedIndex]) {
                patch.topsoil[seedIndex] = draftGarden.defaultTopsoil
            }
        })
    }, [ garden, gardenStore ])

    const handleSetTopsoil = useCallback((patchIndex: number, seedIndex: number, topsoilId: TopsoilId | null) => {
        gardenStore.updateOne(garden.id, draftGarden => {
            draftGarden.patches[patchIndex].topsoil[seedIndex] = topsoilId
        })
    }, [ garden, gardenStore ])

    if (isEmpty) {
        return <div className="garden-patch-cell is-empty" />
    }

    return (
        <GardenPatchContext.Provider value={{
            garden,
            patch,
            patchIndex,
            setSeed: handleSetSeed,
            setTopsoil: handleSetTopsoil
        }}>
            <GardenPatchSwitch />
        </GardenPatchContext.Provider>
    )
}
