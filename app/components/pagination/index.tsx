'use client'

import React from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

interface TablePaginationProps {
    totalItems: number
    itemsPerPage: number
    currentPage: number
    onPageChange: (page: number) => void
}

export default function TablePagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange
}: TablePaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

    const getPageNumbers = () => {
        const pages: Array<number | '...'> = []
        
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                pages.push(i)
            } else if (
                i === currentPage - 2 || 
                i === currentPage + 2
            ) {
                pages.push('...')
            }
        }
        
        return pages.filter((item, index) => item !== '...' || pages[index - 1] !== '...')
    }

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className="px-6 py-4 flex items-center justify-between border-t border-border-theme bg-card-bg rounded-b-2xl">
            {/* Info Text */}
            <p className="text-sm text-muted-theme">
                {totalItems === 0 
                    ? "No entries" 
                    : `Showing ${startItem} to ${endItem} of ${totalItems} entries`
                }
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border-theme text-muted-theme hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <MdChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((item, idx) => (
                    <React.Fragment key={idx}>
                        {item === '...' ? (
                            <span className="w-8 h-8 flex items-center justify-center text-sm text-muted-theme">
                                …
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(item as number)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                    currentPage === item
                                        ? "bg-[#3B3B42] text-white shadow-md"
                                        : "border border-border-theme text-muted-theme hover:bg-surface-hover"
                                }`}
                            >
                                {item}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border-theme text-muted-theme hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <MdChevronRight size={18} />
                </button>
            </div>
        </div>
    )
}