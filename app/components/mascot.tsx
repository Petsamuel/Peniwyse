"use client";

import { useEffect, useRef, useState } from "react";

export function Mascot({ isClosed }: { isClosed: boolean }) {
  const owlRef = useRef<SVGSVGElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        isClosed ||
        !owlRef.current ||
        !leftPupilRef.current ||
        !rightPupilRef.current
      )
        return;

      const maxOffset = 8;
      const rect = owlRef.current.getBoundingClientRect();
      const vb = 400;
      const scale = rect.width / vb;

      const lBaseCx = 160;
      const lBaseCy = 195;
      const rBaseCx = 240;
      const rBaseCy = 195;

      const lCenter = {
        x: rect.left + lBaseCx * scale,
        y: rect.top + lBaseCy * scale,
      };
      const rCenter = {
        x: rect.left + rBaseCx * scale,
        y: rect.top + rBaseCy * scale,
      };

      const updatePupil = (
        pupil: SVGCircleElement,
        center: { x: number; y: number },
        baseCx: number,
        baseCy: number,
      ) => {
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const dist = Math.min(Math.hypot(dx, dy) / 12, maxOffset);
        const angle = Math.atan2(dy, dx);
        const offsetX = Math.cos(angle) * dist;
        const offsetY = Math.sin(angle) * dist;
        pupil.setAttribute("cx", String(baseCx + offsetX));
        pupil.setAttribute("cy", String(baseCy + offsetY));
      };

      updatePupil(leftPupilRef.current, lCenter, lBaseCx, lBaseCy);
      updatePupil(rightPupilRef.current, rCenter, rBaseCx, rBaseCy);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isClosed]);

  useEffect(() => {
    if (isClosed && leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.setAttribute("cx", "160");
      leftPupilRef.current.setAttribute("cy", "195");
      rightPupilRef.current.setAttribute("cx", "240");
      rightPupilRef.current.setAttribute("cy", "195");
    }
  }, [isClosed]);

  // Blink only when the cursor is idle (not moving)
  useEffect(() => {
    if (isClosed) return;

    // Track whether the cursor is idle
    const IDLE_THRESHOLD = 1500; // ms of no movement before we consider cursor idle
    let isIdle = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let blinkTimer: ReturnType<typeof setTimeout> | null = null;

    const cancelBlink = () => {
      if (blinkTimer !== null) {
        clearTimeout(blinkTimer);
        blinkTimer = null;
      }
      // Snap eyes back open immediately if a blink was mid-flight
      setIsBlinking(false);
    };

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      blinkTimer = setTimeout(() => {
        // Double-check still idle before blinking
        if (!isIdle) return;
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          if (isIdle) scheduleBlink();
        }, 150);
      }, delay);
    };

    const onMouseMove = () => {
      // Mark as active and cancel any pending blink
      if (isIdle) {
        isIdle = false;
        cancelBlink();
      }
      // Reset the idle countdown
      if (idleTimer !== null) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
        scheduleBlink();
      }, IDLE_THRESHOLD);
    };

    // Start idle timer immediately (in case cursor never moves)
    idleTimer = setTimeout(() => {
      isIdle = true;
      scheduleBlink();
    }, IDLE_THRESHOLD);

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (idleTimer !== null) clearTimeout(idleTimer);
      if (blinkTimer !== null) clearTimeout(blinkTimer);
    };
  }, [isClosed]);

  return (
    <div className="w-full max-w-[280px] absolute left-0 right-0 mx-auto bottom-[calc(100%-80px)] pointer-events-none">
      <svg
        ref={owlRef}
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
        style={
          {
            zIndex: 20,
            position: "relative",
            "--owl-body": "#3b82f6",
            "--owl-body-dark": "#2563eb",
            "--owl-belly": "#eff6ff",
            "--accent": "#FFB454",
          } as React.CSSProperties
        }
      >
        <style>
          {`
            .eye-lid {
              transition: transform .18s ease;
              transform-origin: center;
              transform-box: fill-box;
            }
            .pupil {
              transition: transform .05s linear;
            }
            .eye-white {
              transition: opacity .18s ease;
            }
            .closed .eye-lid { transform: scaleY(1); }
            .closed .pupil, .closed .eye-white { opacity:0; }
            .open .eye-lid { transform: scaleY(0); }
            .blinking .eye-lid { transform: scaleY(1); }
            .blinking .pupil, .blinking .eye-white { opacity:0; }
          `}
        </style>

        <g className={isClosed ? "closed" : isBlinking ? "blinking" : "open"}>
          <path
            d="M120 240 Q100 150 200 130 Q300 150 280 240 Q300 300 200 320 Q100 300 120 240 Z"
            fill="var(--owl-body)"
          />
          <ellipse cx="200" cy="255" rx="70" ry="55" fill="var(--owl-belly)" />

          {/* <path
            d="M150 145 Q140 105 165 90 Q160 125 172 140 Z"
            fill="var(--owl-body-dark)"
          />
          <path
            d="M250 145 Q260 105 235 90 Q240 125 228 140 Z"
            fill="var(--owl-body-dark)"
          /> */}

          <circle
            cx="160"
            cy="195"
            r="42"
            fill="#FFFFFF"
            className="eye-white"
          />
          <circle
            cx="240"
            cy="195"
            r="42"
            fill="#FFFFFF"
            className="eye-white"
          />

          <circle
            ref={leftPupilRef}
            className="pupil"
            cx="160"
            cy="195"
            r="18"
            fill="#221A45"
          />
          <circle
            ref={rightPupilRef}
            className="pupil"
            cx="240"
            cy="195"
            r="18"
            fill="#221A45"
          />

          <path
            className="eye-lid"
            d="M118 195 Q160 165 202 195 Q160 195 118 195 Z"
            fill="var(--owl-body)"
          />
          <path
            className="eye-lid"
            d="M198 195 Q240 165 282 195 Q240 195 198 195 Z"
            fill="var(--owl-body)"
          />

          <path
            d="M188 220 Q200 240 212 220 Q200 232 188 220 Z"
            fill="var(--accent)"
          />
        </g>
      </svg>

      {/* Foreground SVG: Wings/Hands (In Front of Form) */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto absolute inset-0 drop-shadow-2xl"
        style={
          {
            zIndex: 40,
            "--owl-body": "#3b82f6",
            "--owl-body-dark": "#2563eb",
          } as React.CSSProperties
        }
      >
        <style>
          {`
            .wing {
              transition: transform .3s cubic-bezier(0.4, 0.0, 0.2, 1);
              transform-origin: center top;
              transform-box: fill-box;
            }
            .closed #wing-l { transform: translateY(-75px) translateX(45px) rotate(40deg); }
            .closed #wing-r { transform: translateY(-75px) translateX(-45px) rotate(-40deg); }
          `}
        </style>
        
        <g className={isClosed ? "closed" : "open"}>
          <path
            id="wing-l"
            className="wing"
            d="M120 230 Q80 260 95 320 Q125 300 140 250 Z"
            fill="var(--owl-body-dark)"
          />
          <path
            id="wing-r"
            className="wing"
            d="M280 230 Q320 260 305 320 Q275 300 260 250 Z"
            fill="var(--owl-body-dark)"
          />

          <ellipse
            cx="180"
            cy="290"
            rx="14"
            ry="8"
            fill="var(--owl-body-dark)"
            opacity="0.5"
          />
          <ellipse
            cx="220"
            cy="290"
            rx="14"
            ry="8"
            fill="var(--owl-body-dark)"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  );
}
