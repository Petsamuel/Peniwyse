import { MdArrowForward } from 'react-icons/md'

export function NavButtons({
    onPrev, onNext, nextLabel = 'Save & continue', showPrev = true, disabled = false, isLoading = false,
}: {
    onPrev?: () => void
    onNext: () => void
    nextLabel?: string
    showPrev?: boolean
    disabled?: boolean
    isLoading?: boolean
}) {
    return (
        <div className="flex justify-end items-center gap-4 mt-10">
            {showPrev && (
                <button 
                    onClick={onPrev} 
                    className="px-6 py-2.5 text-sm font-bold text-muted-theme hover:text-foreground transition-colors disabled:opacity-30"
                >
                    PREVIOUS
                </button>
            )}
            <button 
                onClick={onNext} 
                disabled={disabled} 
                className="flex items-center gap-2 px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:bg-accent/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        {nextLabel}
                        <MdArrowForward size={18} />
                    </>
                )}
            </button>
        </div>
    )
}
