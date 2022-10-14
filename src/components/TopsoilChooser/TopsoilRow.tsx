import React, {CSSProperties, FC, ReactNode} from "react"
import {useSeedStore} from "../SeedDb/useSeedStore"
import classNames from "classnames"
import {TopsoilId} from "../../models/Topsoil"

export const TopsoilRow: FC<{
    topsoilId: TopsoilId,
    onClick?: (topsoilId: TopsoilId, event: React.MouseEvent) => void,
    style?: CSSProperties,
    actions?: ReactNode
}> = ({ topsoilId, onClick, style, actions }) => {
    const topsoilsById = useSeedStore(ss => ss.topsoils.byId)
    const topsoil = topsoilsById[topsoilId]

    return (
        <div onClick={onClick
                ? e => onClick(topsoil.id, e)
                : undefined}
             className={classNames({
                 'seed-row': true,
                 'clickable': !!onClick,
                 'hover-effect': !actions
             })}
             style={style}>
            <div className="seed-thumbnail">
                <img alt="" src={topsoil.xivDbIconHD}/>
            </div>
            <div className="seed-info">
                <div className="seed-name">{topsoil.name}</div>
                <div className="seed-details">
                    {topsoil.item.Description}
                </div>
            </div>
            {actions && (
                <div className="seed-actions">
                    {actions}
                </div>
            )}
        </div>
    )
}
