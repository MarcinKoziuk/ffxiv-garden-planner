import {useSeedStore} from "./useSeedStore"
import {FC, ReactNode, useEffect} from "react"

export const SeedDbProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const initialize = useSeedStore.use.initialize();
    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        initialize()
    }, [ initialize ])

    return <>{children}</>;
}
