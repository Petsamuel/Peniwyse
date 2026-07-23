'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    startOfWeek, endOfWeek, isSameMonth, isSameDay, 
    eachDayOfInterval, startOfDay, isBefore, getYear, setYear, isAfter 
} from 'date-fns'

interface DatePickerProps {
    value: string | null | undefined 
    onChange: (isoDate: string) => void
    placeholder?: string
    disableFuture?: boolean 
    disablePast?: boolean
    maxDate?: Date
    minDate?: Date
}

export default function DatePicker({ 
    value, 
    onChange, 
    placeholder = "Select date",
    disableFuture = false,
    disablePast = false,
    maxDate,
    minDate
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<'days' | 'years'>('days')
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    const today = useMemo(() => startOfDay(new Date()), [])
    const effectiveMaxDate = maxDate || (disableFuture ? today : null)
    const effectiveMinDate = minDate || (disablePast ? today : null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setMode('days')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(viewDate))
        const end = endOfWeek(endOfMonth(viewDate))
        return eachDayOfInterval({ start, end })
    }, [viewDate])

    const yearGrid = useMemo(() => {
        const currentYear = getYear(viewDate)
        const startYear = currentYear - (currentYear % 12)
        return Array.from({ length: 12 }, (_, i) => startYear + i)
    }, [viewDate])

    const handleDateClick = (date: Date) => {
        if (effectiveMaxDate && isAfter(startOfDay(date), effectiveMaxDate)) return
        if (effectiveMinDate && isBefore(startOfDay(date), effectiveMinDate)) return
        onChange(format(date, 'yyyy-MM-dd'))
        setIsOpen(false)
    }

    const handleYearSelect = (year: number) => {
        if (effectiveMaxDate && year > getYear(effectiveMaxDate)) return
        if (effectiveMinDate && year < getYear(effectiveMinDate)) return
        setViewDate(setYear(viewDate, year))
        setMode('days')
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 rounded-xl border border-border-theme bg-card-bg flex items-center justify-between cursor-pointer transition-all hover:border-border-theme ${isOpen ? 'border-[#185fa5] ring-4 ring-[#185fa5]/5' : ''}`}
            >
                <span className={`text-sm ${value ? 'text-foreground font-medium' : 'text-gray-300'}`}>
                    {value ? format(new Date(value), 'PPP') : placeholder}
                </span>
                <MdCalendarToday size={16} className={isOpen ? 'text-[#185fa5]' : 'text-muted-theme'} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 mt-2 bg-card-bg rounded-2xl shadow-xl border border-border-theme p-5 w-75 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                type="button"
                                onClick={() => setMode(mode === 'days' ? 'years' : 'days')}
                                className="flex items-center gap-1.5 px-3 py-1 hover:bg-surface-hover rounded-lg transition-colors group"
                            >
                                <span className="text-sm font-bold text-foreground">
                                    {mode === 'days' ? format(viewDate, 'MMMM yyyy') : 'Select Year'}
                                </span>
                                <MdKeyboardArrowDown className={`text-muted-theme transition-transform ${mode === 'years' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <div className="flex gap-1">
                                <button type="button" onClick={() => setViewDate(mode === 'days' ? subMonths(viewDate, 1) : setYear(viewDate, getYear(viewDate) - 12))} className="p-1 hover:bg-surface-hover rounded-full transition-colors">
                                    <MdChevronLeft size={20} className="text-muted-theme" />
                                </button>
                                <button type="button" onClick={() => setViewDate(mode === 'days' ? addMonths(viewDate, 1) : setYear(viewDate, getYear(viewDate) + 12))} className="p-1 hover:bg-surface-hover rounded-full transition-colors">
                                    <MdChevronRight size={20} className="text-muted-theme" />
                                </button>
                            </div>
                        </div>

                        {mode === 'days' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="grid grid-cols-7 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <span key={d} className="text-[10px] font-bold text-center text-gray-300 uppercase tracking-widest">{d}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((date, i) => {
                                        const normalizedDate = startOfDay(date)
                                        const isSelected = value ? isSameDay(normalizedDate, new Date(value)) : false
                                        const isDisabled = 
                                            (!!effectiveMaxDate && isAfter(normalizedDate, effectiveMaxDate)) ||
                                            (!!effectiveMinDate && isBefore(normalizedDate, effectiveMinDate))
                                        
                                        return (
                                            <button
                                                key={i} type="button" disabled={isDisabled}
                                                onClick={() => handleDateClick(date)}
                                                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center
                                                    ${isSelected ? 'bg-[#185fa5] text-white shadow-lg shadow-[#185fa5]/20' : ''}
                                                    ${isDisabled 
                                                        ? 'text-gray-300 line-through cursor-not-allowed bg-transparent' 
                                                        : isSameMonth(normalizedDate, viewDate) 
                                                        ? 'text-foreground hover:bg-blue-50 hover:text-[#185fa5]' 
                                                        : 'text-gray-200'
                                                    }
                                                `}
                                            >
                                                {format(date, 'd')}
                                            </button>
                                        )
                                    })}
                                </div>
                                
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2">
                                {yearGrid.map((year) => {
                                    const isYearDisabled = 
                                        (!!effectiveMaxDate && year > getYear(effectiveMaxDate)) ||
                                        (!!effectiveMinDate && year < getYear(effectiveMinDate))
                                    return (
                                        <button
                                            key={year} type="button" disabled={isYearDisabled}
                                            onClick={() => handleYearSelect(year)}
                                            className={`py-3 rounded-xl text-xs font-bold transition-all
                                                ${getYear(viewDate) === year 
                                                    ? 'bg-[#185fa5] text-white' 
                                                    : isYearDisabled 
                                                    ? 'text-gray-300 line-through cursor-not-allowed' 
                                                    : 'text-foreground hover:bg-surface-hover'
                                                }
                                            `}
                                        >
                                            {year}
                                        </button>
                                    )
                                })}
                            </motion.div>
                        )}

                        <div className="mt-4 pt-4 border-t border-border-theme flex gap-2">
                            <button 
                                type="button"
                                onClick={() => { setViewDate(new Date()); setMode('days'); }}
                                className="flex-1 py-2 text-[10px] font-bold text-muted-theme hover:text-foreground transition-colors uppercase tracking-widest"
                            >
                                Reset
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleDateClick(new Date())}
                                className="flex-1 py-2 text-[10px] font-bold text-[#185fa5] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-widest"
                            >
                                Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function MdKeyboardArrowDown({ className }: { className?: string }) {
    return (
        <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    )
}