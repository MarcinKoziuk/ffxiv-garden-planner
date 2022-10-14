import React, {createContext, Dispatch, FC, ReactNode, SetStateAction, useCallback, useEffect, useState} from "react"

interface IMobileSidebarContext {
	active: boolean
	setActive: Dispatch<SetStateAction<boolean>>
}
export const MobileSidebarContext = createContext<IMobileSidebarContext | null>(null);

/*
 * This affects many things in the tree, so doing it imperatively - in one place - seems a better solution.
 */
export const MobileSidebarManager: FC<{
	children: ReactNode
}> = React.memo(({ children }) => {
	const [ mobileSidebarActive, setMobileSidebarActive ] = useState(false);

	const handleCloseMobileSidebar = useCallback(e => {
		setMobileSidebarActive(false)
	}, [ setMobileSidebarActive ])

	const handleCloseMobileSidebarForNavlinks = useCallback(e => {
		if (e.target.tagName === 'A') {
			handleCloseMobileSidebar(e);
		}
	}, [ handleCloseMobileSidebar ])

	const handleBurgerClick = useCallback(e => {
		setMobileSidebarActive(prevActive => !prevActive)
		e.stopPropagation()
	}, [ setMobileSidebarActive ])

	useEffect(() => {
		const hideSidebarWhenClicked = document.querySelectorAll('.main, .header')
		hideSidebarWhenClicked.forEach(el =>
			el.addEventListener('click', handleCloseMobileSidebar))

		const sidebar = document.querySelector('.sidebar');

		if (sidebar) {
			sidebar.addEventListener('click', handleCloseMobileSidebarForNavlinks)
		}

		const burger = document.querySelector('.hamburger');
		if (burger) {
			burger.addEventListener('click', handleBurgerClick)
		}

		return () => {
			hideSidebarWhenClicked.forEach(el =>
				el.removeEventListener('click', handleCloseMobileSidebar))
			if (sidebar) {
				sidebar.removeEventListener('click', handleCloseMobileSidebarForNavlinks)
			}
			if (burger) {
				burger.removeEventListener('click', handleBurgerClick)
			}
		}
	}, [ handleCloseMobileSidebar, handleCloseMobileSidebarForNavlinks, handleBurgerClick ])

	useEffect(() => {
		const html = document.getElementsByTagName('html')[0];
		if (html) {
			if (mobileSidebarActive) {
				html.classList.add('move-to-right')
			} else {
				html.classList.remove('move-to-right')
			}
		}

		const burger = document.querySelector('.hamburger');
		if (burger) {
			if (mobileSidebarActive) {
				burger.classList.add('is-active3')
			} else {
				burger.classList.remove('is-active3')
			}
		}
	}, [ mobileSidebarActive ]);

	useEffect(() => {
		const updateAppHeight = () =>
			document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
		window.addEventListener('resize', updateAppHeight)
		updateAppHeight()
		return () => {
			window.removeEventListener('resize', updateAppHeight)
		}
	}, [])

	return (
		<MobileSidebarContext.Provider value={{
			active: mobileSidebarActive,
			setActive: setMobileSidebarActive
		}}>
			{children}
		</MobileSidebarContext.Provider>
	)
})
