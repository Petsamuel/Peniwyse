'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

const emptySubscribe = () => () => {}

export function ClientPortal({ children }: { children: React.ReactNode }) {
    const isClient = useSyncExternalStore(
        emptySubscribe,
        () => true,   
        () => false   
    )

    if (!isClient) return null
    return createPortal(children, document.body)
}