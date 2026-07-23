'use client'

import { useState, useRef, useEffect } from 'react'
import ArrowDown from "@/app/assets/icons/arrow-down"
import { motion, AnimatePresence } from 'framer-motion'

interface FieldSelectProps {
    placeholder: string
    value: string
    onChange: (v: string) => void
    options: string[]
    description?: string
}

function FieldSelect({
    placeholder, 
    value, 
    onChange, 
    options,
    description
}: FieldSelectProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    
    const isRequired = placeholder.includes('*')
    const label = placeholder.replace('*', '').trim()

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
            <label className="text-[10px] font-bold text-muted-theme uppercase tracking-wider ml-1">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`w-full px-4 py-2.5 pr-10 text-sm text-left outline-none border rounded-xl transition-all bg-card-bg flex items-center justify-between ${
                        open ? 'border-[#185fa5] ring-4 ring-[#185fa5]/5' : 'border-border-theme'
                    } ${value ? 'text-foreground' : 'text-muted-theme'}`}
                >
                    <span className="truncate">{value || <span className="opacity-50">{placeholder}</span>}</span>
                    <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                        <ArrowDown />
                    </span>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            className="absolute z-[100] left-0 right-0 top-full mt-2 bg-card-bg border border-border-theme rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="bg-surface-hover px-4 py-2.5 text-[11px] font-bold text-muted-theme uppercase tracking-wider border-b border-border-theme">
                                {placeholder}
                            </div>
                            <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                                {options.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt)
                                            setOpen(false)
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover ${
                                            value === opt ? 'text-[#185fa5] font-bold bg-blue-50/30' : 'text-foreground'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {description && (
                <p className="text-[10px] font-medium text-muted-theme ml-1 italic">
                    {description}
                </p>
            )}
        </div>
    )
}

export default FieldSelect