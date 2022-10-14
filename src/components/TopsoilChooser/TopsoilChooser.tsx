import {Dialog, DialogBody, DialogProps} from "../Dialog/Dialog"
import {TopsoilId} from "../../models/Topsoil"
import React, {FC, useCallback} from "react"
import {useSeedStore} from "../SeedDb/useSeedStore"
import {TopsoilRow} from "./TopsoilRow"
import {ButtonIcon} from "../Button/buttons"
import {Erase} from "@icon-park/react"

interface TopsoilChooserProps extends DialogProps {
    topsoilId?: TopsoilId,
    onChoose: (topsoilId: TopsoilId | null) => void
}

export const TopsoilChooser: FC<TopsoilChooserProps> = ({ topsoilId, onChoose, ...dialogProps }) => {
    const seedStore = useSeedStore()

    const handleChooseAndDismiss = useCallback((topsoilId: TopsoilId | null, e: React.MouseEvent) => {
        onChoose(topsoilId)
        if (dialogProps.onDismiss) dialogProps.onDismiss(e)
    }, [ dialogProps, onChoose ])

    return (
        <Dialog title="Choose topsoil"
                className="topsoil-chooser"
                extraActions={<>
                    {!!topsoilId && (
                        <ButtonIcon icon={<Erase />}
                                    className="primary"
                                    onClick={e => handleChooseAndDismiss(null, e)}>
                            Clear topsoil
                        </ButtonIcon>
                    )}
                </>} {...dialogProps}>
            <DialogBody>
                {seedStore.topsoils.ids.map(topsoilId => (
                    <TopsoilRow topsoilId={topsoilId} onClick={handleChooseAndDismiss} />
                ))}
            </DialogBody>
        </Dialog>
    )
}