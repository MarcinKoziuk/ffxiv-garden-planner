import React, {FC, useCallback, useMemo, useState} from "react"
import {Dialog, DialogBody, DialogProps} from "../Dialog/Dialog"
import {FixedSizeList, ListChildComponentProps} from "react-window"
import "./SeedChooser.css"
import {SeedSearchFilter, SeedSearchFindBy, useSeedStore} from "../SeedDb/useSeedStore"
import {Seed} from "../../models/Seed"
import AutoSizer from "react-virtualized-auto-sizer"
import {useLocalStorage} from "usehooks-ts"
import {Erase} from "@icon-park/react"
import {Button, ButtonIcon} from "../Button/buttons"
import {SeedRow} from "./SeedRow"

interface SeedChooserProps extends DialogProps {
    seedId?: number,
    onChoose: (seedId: number | null) => void
}

export const SeedChooser: FC<SeedChooserProps> = ({ seedId, onChoose, ...dialogProps }) => {
    const seedStore = useSeedStore()

    const seed = seedId ? seedStore.seeds.byId[seedId] : null;

    const [ seedHistory, pushSeedHistory ] = useSeedHistory()

    const [ filter, setFilter ] = useState<SeedSearchFilter>({
        query: '',
        findBy: [ SeedSearchFindBy.SEED_NAME, SeedSearchFindBy.CROP_NAME ]

    })


    const seedsFiltered = useMemo(() => seedStore.findSeeds(filter), [ seedStore, filter ])

    const handleChooseAndDismiss = useCallback((seedId: number | null, e: React.MouseEvent) => {
        pushSeedHistory(seedId)
        onChoose(seedId)
        if (dialogProps.onDismiss) dialogProps.onDismiss(e)
    }, [ pushSeedHistory, dialogProps, onChoose ])
    
    const handleFilterQueryChange = useCallback(e => {
        const query = e.currentTarget.value
        setFilter(filter => ({
            ...filter,
            query
        }))
    }, [ setFilter ])

    const title = seed ? `Change current seed: ${seed.name}` : 'Select a seed';

    return (
        <Dialog title={title}
                className="seed-chooser"
                extraActions={<>
                    {!!seedId && (
                        <ButtonIcon icon={<Erase />}
                                    className="primary"
                                    onClick={e => handleChooseAndDismiss(null, e)}>
                            Clear seed
                        </ButtonIcon>
                    )}
                </>} {...dialogProps}>
            <DialogBody className="seed-chooser-body">
                <div className="search-input-row">
                    <input type="search"
                           autoFocus
                           placeholder="Search by seed or crop name..."
                           value={filter.query}
                           onChange={handleFilterQueryChange}
                           className="form-input" />
                </div>
                { !filter.query && (
                    <div className="dialog-body-section">
                        <label>History</label>
                        <div className="seed-list">
                            {seedHistory.map(seedId => (
                                <SeedRow key={seedId} seedId={seedId} onClick={handleChooseAndDismiss} />
                            ))}
                        </div>
                    </div>
                )}
                <div className="dialog-body-section seed-search-list-section">
                    <label>Seeds</label>
                    <SeedSearchList seeds={seedsFiltered}
                                    onClick={handleChooseAndDismiss} />
                </div>
            </DialogBody>
        </Dialog>
    )
}

const MAX_HISTORY = 5

function useSeedHistory(): [
    number[],
    (seedId: number | null) => void
] {
    const [ seedIdHistory, setSeedIdHistory ] = useLocalStorage<number[]>("seed-id-history", [])

    const pushSeedHistory = useCallback((seedId: number | null) => {
        if (!seedId) return;

        setSeedIdHistory(prevHistory => {
            const prevHistoryFilteredSliced = prevHistory
                .filter(id => id !== seedId)
                .slice(0, MAX_HISTORY - 1)
            return [ seedId, ...prevHistoryFilteredSliced ]
        })
    }, [ setSeedIdHistory ])

    return [ seedIdHistory, pushSeedHistory ]
}

interface SeedData {
    seeds: Seed[],
    onClick: (seedId: number, event: React.MouseEvent) => void
}

const SeedSearchList: FC<SeedData> = (seedData) => (
    <div style={{ flex: '1 1 auto' }}>
        <div style={{ height: 'calc(100% - 10px)' }}>{/* Somehow AutoSizer overflows a little... (???) */}
            <AutoSizer>
                {({ height, width }) =>  (
                    <FixedSizeList itemCount={seedData.seeds.length}
                                   itemSize={54}
                                   height={height}
                                   width={width}
                                   itemData={seedData}
                                   className="seed-list">
                        {SeedRowVirtual}
                    </FixedSizeList>
                )}
            </AutoSizer>
        </div>

    </div>
)

const SeedRowVirtual: FC<ListChildComponentProps<SeedData>> = ({ index, data, style }) => (
    <SeedRow seedId={data.seeds[index].id}
             onClick={data.onClick}
             style={style} />
)

