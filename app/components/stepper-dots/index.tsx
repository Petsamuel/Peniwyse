// import { STEPS } from "@/app/onboarding/type"

// function StepperDots({ step }: { step: number }) {
//     return (
//         <div className="w-full px-6">
//             <div className="relative grid grid-cols-7 w-full">
//                 {/* Base connector line */}
//                 <div className="absolute top-3 left-[10%] right-[10%] h-[1.5px] bg-card-bg/25 z-0" />
//                 {/* Completed progress line */}
//                 {step > 0 && (
//                     <div
//                         className="absolute top-3 left-[10%] h-[1.5px] bg-[#EC407A] z-0 transition-all duration-300"
//                         style={{ width: `${(step / (STEPS.length - 1)) * 80}%` }}
//                     />
//                 )}

//                 {STEPS.map((label, i) => {
//                     const isCompleted = i < step
//                     const isCurrent = i === step
//                     return (
//                         <div key={label} className="relative z-10 flex flex-col items-center">
//                             <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
//                                 isCompleted
//                                     ? 'bg-[#EC407A] shadow-sm'
//                                     : isCurrent
//                                     ? 'bg-card-bg'
//                                     : 'bg-[#706f78]'
//                             }`}>
//                                 {isCompleted && (
//                                     <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                                     </svg>
//                                 )}
//                                 {isCurrent && (
//                                     <div className="w-2.5 h-2.5 rounded-full bg-[#EC407A]" />
//                                 )}
//                             </div>
//                             <span className={`mt-2 text-[11px] whitespace-nowrap text-center transition-colors duration-300 ${
//                                 isCompleted ? 'text-[#EC407A] font-semibold'
//                                 : isCurrent ? 'text-white font-semibold'
//                                 : 'text-white/50'
//                             }`}>
//                                 {label}
//                             </span>
//                         </div>
//                     )
//                 })}
//             </div>
//         </div>
//     )
// }

// export default StepperDots




// components/stepper-dots.tsx
'use client'

function StepperDots({ steps, currentStep }: { steps: string[], currentStep: number }) {
    const total = steps.length;
    
    return (
        <div className="w-full px-6">
            <div 
                className="relative grid w-full" 
                style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
            >
                {/* Base connector line */}
                <div className="absolute top-4 left-[10%] right-[10%] h-[0.5px] bg-card-bg/5 z-0" />
                
                {/* Completed progress line */}
                {currentStep > 0 && (
                    <div
                        className="absolute top-4 left-[10%] h-[0.5px] bg-[#185fa5] z-0 transition-all duration-500"
                        style={{ 
                            width: `${(currentStep / (total - 1)) * 80}%`,
                        }}
                    />
                )}

                {steps.map((label, i) => {
                    const isCompleted = i < currentStep
                    const isCurrent = i === currentStep

                    return (
                        <div key={label} className="relative z-10 flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold ${
                                isCompleted
                                    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                    : isCurrent
                                    ? 'bg-white text-[#185fa5] shadow-[0_0_20px_rgba(255,255,255,0.4)] ring-4 ring-white/10 scale-110'
                                    : 'bg-card-bg/5 text-white/30 border border-white/10 backdrop-blur-md'
                            }`}>
                                {isCompleted ? (
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span>{i + 1}</span>
                                )}
                            </div>
                            <span className={`mt-4 text-[10px] uppercase font-extrabold tracking-[0.1em] whitespace-nowrap text-center transition-colors duration-300 ${
                                isCurrent ? 'text-white' : isCompleted ? 'text-blue-100/60' : 'text-white/20'
                            }`}>
                                {label}
                            </span>
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default StepperDots