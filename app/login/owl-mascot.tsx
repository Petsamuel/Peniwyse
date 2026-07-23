"use client";

import React, { useEffect, useRef } from "react";

interface OwlMascotProps {
  isPasswordFocused: boolean;
}

export default function OwlMascot({ isPasswordFocused }: OwlMascotProps) {
  const owlRef = useRef<SVGSVGElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const owl = owlRef.current;
    const lPupil = leftPupilRef.current;
    const rPupil = rightPupilRef.current;
    
    if (!owl || !lPupil || !rPupil) return;

    const maxOffset = 8;
    const pupils = [
      { el: lPupil, baseCx: 160, baseCy: 195 },
      { el: rPupil, baseCx: 240, baseCy: 195 }
    ];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = owl.getBoundingClientRect();
      const vb = 400;
      const scale = rect.width / vb;
      
      pupils.forEach((pupil) => {
        const center = {
          x: rect.left + pupil.baseCx * scale,
          y: rect.top + pupil.baseCy * scale
        };
        
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const dist = Math.min(Math.hypot(dx, dy) / 12, maxOffset);
        const angle = Math.atan2(dy, dx);
        
        const offsetX = Math.cos(angle) * dist;
        const offsetY = Math.sin(angle) * dist;
        
        pupil.el.setAttribute('cx', String(pupil.baseCx + offsetX));
        pupil.el.setAttribute('cy', String(pupil.baseCy + offsetY));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full max-w-[460px] aspect-square relative z-10 flex items-center justify-center">
      <svg 
        ref={owlRef}
        viewBox="0 0 400 400" 
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-all duration-300 ${isPasswordFocused ? 'owl-closed' : ''}`}
      >
        <style>
          {`
            .eye-lid {
              transition: transform .18s ease;
              transform-origin: center;
              transform-box: fill-box;
              transform: scaleY(0);
            }
            .pupil {
              transition: transform .05s linear, opacity 0.18s ease;
            }
            .eye-white {
              transition: opacity 0.18s ease;
            }
            .owl-closed .eye-lid { transform: scaleY(1); }
            .owl-closed .pupil, .owl-closed .eye-white { opacity: 0; }
          `}
        </style>
        
        {/* Shadow */}
        <ellipse cx="200" cy="330" rx="90" ry="18" fill="#000" opacity="0.15"/>

        {/* Body - Teal */}
        <path d="M120 240 Q100 150 200 130 Q300 150 280 240 Q300 300 200 320 Q100 300 120 240 Z" fill="#24959a"/>

        {/* Belly - Light grey/white */}
        <ellipse cx="200" cy="255" rx="70" ry="55" fill="#f0f7f7"/>

        {/* Wings - Dark Blue */}
        <path id="wing-l" d="M120 230 Q80 260 95 320 Q125 300 140 250 Z" fill="#185fa5"/>
        <path id="wing-r" d="M280 230 Q320 260 305 320 Q275 300 260 250 Z" fill="#185fa5"/>

        {/* Ears - Dark Blue */}
        <path d="M150 145 Q140 105 165 90 Q160 125 172 140 Z" fill="#185fa5"/>
        <path d="M250 145 Q260 105 235 90 Q240 125 228 140 Z" fill="#185fa5"/>

        {/* Eye Whites */}
        <circle cx="160" cy="195" r="42" fill="#FFFFFF" className="eye-white"/>
        <circle cx="240" cy="195" r="42" fill="#FFFFFF" className="eye-white"/>

        {/* Pupils */}
        <g id="eye-l">
          <circle ref={leftPupilRef} className="pupil" cx="160" cy="195" r="18" fill="#221A45"/>
        </g>
        <g id="eye-r">
          <circle ref={rightPupilRef} className="pupil" cx="240" cy="195" r="18" fill="#221A45"/>
        </g>

        {/* Eye Lids (Teal) */}
        <path className="eye-lid" d="M118 195 Q160 165 202 195 Q160 195 118 195 Z" fill="#24959a" style={{ transformOrigin: '160px 195px' }}/>
        <path className="eye-lid" d="M198 195 Q240 165 282 195 Q240 195 198 195 Z" fill="#24959a" style={{ transformOrigin: '240px 195px' }}/>

        {/* Beak - Orange */}
        <path d="M188 220 Q200 240 212 220 Q200 232 188 220 Z" fill="#F59E0B"/>

        {/* Feet - Dark Blue */}
        <ellipse cx="180" cy="290" rx="14" ry="8" fill="#185fa5" opacity="0.5"/>
        <ellipse cx="220" cy="290" rx="14" ry="8" fill="#185fa5" opacity="0.5"/>
      </svg>
    </div>
  );
}
