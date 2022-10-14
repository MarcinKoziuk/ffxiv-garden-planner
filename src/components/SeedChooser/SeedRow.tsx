import React, {CSSProperties, FC, ReactNode} from "react"
import {useSeedStore} from "../SeedDb/useSeedStore"
import classNames from "classnames"

export const SeedRow: FC<{
    seedId: number,
    onClick?: (seedId: number, event: React.MouseEvent) => void,
    style?: CSSProperties,
    actions?: ReactNode,
    children?: ReactNode
}> = ({ seedId, onClick, style, children, actions }) => {
    const seedsById = useSeedStore(ss => ss.seeds.byId)
    const cropsById = useSeedStore(ss => ss.crops.byId)

    const seed = seedsById[seedId]
    const crop = cropsById[seed.cropId]

    return (
        <div onClick={onClick
                ? e => onClick(seed.id, e)
                : undefined}
             className={classNames({
                 'seed-row': true,
                 'clickable': !!onClick,
                 'hover-effect': !actions && onClick
             })}
             style={style}>
            <div className="seed-thumbnail">
                <img alt="" src={crop.xivDbIconHD}/>
            </div>
            <div className="seed-thumbnail">
                <img alt="" src={seed.xivDbIconHD}/>
            </div>
            <div className="seed-info">
                <div className="seed-name">{crop.name}</div>
                <div className="seed-details">
                    {seed.name}
                </div>
            </div>
            {children}
            {actions && (
                <div className="seed-actions">
                    {actions}
                </div>
            )}
        </div>
    )
}
