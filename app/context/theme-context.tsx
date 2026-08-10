'use client'

import React, { createContext, useContext, useEffect } from 'react'

/**
 * The app is light mode only.
 *
 * The context is kept so existing callers keep compiling, but the theme is
 * fixed: `setTheme` and `toggleTheme` are deliberately inert. Dark mode is also
 * disabled in CSS — see the `dark` custom variant in globals.css — so nothing
 * here can reintroduce it.
 */

type Theme = 'light'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => {},
    setTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('dark')
        root.classList.add('light')
        // Clear the preference anyone stored while the toggle still existed.
        localStorage.removeItem('theme')
    }, [])

    return (
        <ThemeContext.Provider
            value={{ theme: 'light', toggleTheme: () => {}, setTheme: () => {} }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
