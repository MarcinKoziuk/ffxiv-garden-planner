import React from "react"
import {Outlet} from "react-router-dom"
import {Breadcrumbs} from "../Breadcrumb/Breadcrumbs"

export const MyGardens = React.memo(() => {
    return (
        <div>
            <Breadcrumbs />
            <div className="bare-content">
                <Outlet />
            </div>
        </div>
    )
})