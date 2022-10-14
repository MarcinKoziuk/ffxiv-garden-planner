import React, {useCallback, } from 'react'
import {BrowserRouter as Router, NavLink, Route, Routes} from "react-router-dom"
import {MyGardens} from "../MyGardens/MyGardens"
import {MyPlans} from "../MyPlans/MyPlans"
import {Welcome} from "./Welcome"
import {Icon as MdiIcon } from "@mdi/react"
import {mdiSprout} from "@mdi/js"
import {DEFAULT_ICON_CONFIGS, IconProvider, FourLeaves, Leaves, ChartLineArea} from "@icon-park/react"
import {GardenList} from "../MyGardens/GardenList"
import {GardenEdit} from "../MyGardens/GardenEdit"
import {SeedDbProvider} from "../SeedDb/SeedDbProvider"
import {GardenRemove} from "../MyGardens/GardenRemove"
import "./GardenPlannerApp.css"
import "./sidebar.css"
import classNames from "classnames"
import {useRequiredContext} from "../../lib/useRequiredContext"
import {MobileSidebarContext, MobileSidebarManager} from "./MobileSidebarManager"
import {ModalProvider} from "react-modal-hook/dist"
import {MyStatistics} from "../MyStatistics/MyStatistics"

const MobileHamburger = React.memo(() => {
    const { active, setActive } = useRequiredContext(MobileSidebarContext);
    const handleClick = useCallback(e => {
        setActive(prevActive => !prevActive)
        e.stopPropagation()
    }, [ setActive ]);

    return (
        <div id="hamburger-3"
             className={classNames({
                 'hamburger': true
             })}>
            <span className="line"/>
            <span className="line"/>
            <span className="line"/>
        </div>
    )
})

const Header = React.memo(() => (
    <header className="header">
        <MobileHamburger />
        <NavLink to="/" className="header-title">
            <MdiIcon path={mdiSprout} />{' '}
            FFXIV Garden Planner
        </NavLink>
    </header>
))

const Body = React.memo(() => (
    <div className="body">
        <Sidebar/>
        <Main/>
    </div>
))

const Sidebar = React.memo(() => (
    <aside className="sidebar">
        <nav className="nav">
            <label>Planner</label>
            <NavLink to="/gardens">
                <Leaves />{' '}
                My gardens
            </NavLink>
            <NavLink to="/statistics">
                <ChartLineArea />{' '}
                My statistics
            </NavLink>
            <NavLink to="/plans">
                <FourLeaves />{' '}
                My plans
            </NavLink>
        </nav>
        <AboutLala />
    </aside>
))

const AboutLala = React.memo(() => (
    <a href="https://na.finalfantasyxiv.com/lodestone/character/6502466/" target="lodestone" className="about-lala">
            <span className="lala-avatar">
                <img src="/laladark.jpg" alt="Lalatina picture" />
            </span>
        <span className="lala-info">
            Created by<br />
            <span className="lala-name">Lalatina Salaman @ Odin</span>
        </span>
    </a>
))

const Main = React.memo(() => (
    <main className="main">
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="gardens" element={<MyGardens />}>
                <Route index element={<GardenList />} />
                <Route path="new" element={<GardenEdit />} />
                <Route path=":gardenId/edit" element={<GardenEdit />} />
                <Route path=":gardenId/remove" element={<GardenRemove />} />
            </Route>
            <Route path="statistics" element={<MyStatistics />} />
            <Route path="plans" element={<MyPlans />} />
        </Routes>
    </main>
))

const iconConfig = { ...DEFAULT_ICON_CONFIGS };

export const GardenPlannerApp = React.memo(() => (
    <SeedDbProvider>
        <Router>
            <IconProvider value={iconConfig}>
                <ModalProvider>
                    <MobileSidebarManager>
                        <Header />
                        <Body />
                    </MobileSidebarManager>
                </ModalProvider>
            </IconProvider>
        </Router>
    </SeedDbProvider>
));