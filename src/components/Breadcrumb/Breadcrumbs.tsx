import React, {FC} from "react"
import "./Breadcrumbs.css"
import {BreadcrumbsRoute, humanize, useBreadcrumbs} from "./useBreadcrumbs"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {NavLink, PathMatch} from "react-router-dom"
import {SUUID} from "short-uuid"

interface BCParams {
    match: PathMatch
}

const NewBreadcrumb = () => <>New</>;

const GardenBreadcrumb: FC<BCParams> = ({match}) => {
    const gardensStore = useGardenPlannerStore.use.gardens()
    const gardenId = match.params.gardenId as SUUID
    const garden = gardensStore.byId[gardenId]
    return (
        <>{garden ? garden.name : gardenId}</>
    );
}

const routes: BreadcrumbsRoute[] = [
    { path: '/gardens/new', breadcrumb: NewBreadcrumb },
    { path: '/gardens/:gardenId', breadcrumb: GardenBreadcrumb }
]

export const Breadcrumbs = () => {
    const breadcrumbs = useBreadcrumbs(routes)
    if (breadcrumbs.length <= 2) return null

    return (
        <nav>
            <ul className="breadcrumbs">
                {breadcrumbs.map(({key, match, section, isDefault, breadcrumb}, index) => {
                    if (index === 0) return null

                    const theBreadcrumb = isDefault
                        ? humanize(section)
                        : breadcrumb;
                    return (
                        <li>
                            {(index < (breadcrumbs.length - 1)) ? (
                                <NavLink to={match.pathname}>
                                    {theBreadcrumb}
                                </NavLink>
                            ) : (
                                <span>{theBreadcrumb}</span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

