"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { clearClientToken } from "@/app/utils/auth";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const COUNTDOWN_TIME = 10; // 10 seconds

export function useAutoLogout() {
  const [isIdle, setIsIdle] = useState(false);
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_TIME);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (isIdle) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      setRemainingTime(COUNTDOWN_TIME);
    }, IDLE_TIMEOUT);
  }, [isIdle]);

  const confirmPresence = useCallback(() => {
    setIsIdle(false);
    setRemainingTime(COUNTDOWN_TIME);
    resetTimer();
  }, [resetTimer]);

  const performLogout = useCallback(() => {
    // Clear authentication cookie, role, and storage
    clearClientToken();
    localStorage.removeItem("peniwyse_role");
    localStorage.removeItem("token");
    sessionStorage.clear();

    // Close the dialog to trigger the fadeout animation
    setIsIdle(false);

    // Delay the page redirect slightly to allow the fadeout animation to complete
    setTimeout(() => {
      window.location.href = "/login";
    }, 400);
  }, []);

  useEffect(() => {
    resetTimer();

    const events = ["mousemove", "keydown", "wheel", "mousedown", "touchstart", "touchmove"];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [resetTimer]);

  useEffect(() => {
    if (isIdle) {
      countdownTimerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            performLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isIdle, performLogout]);

  return {
    isIdle,
    confirmPresence,
    performLogout,
    remainingTime,
  };
}
