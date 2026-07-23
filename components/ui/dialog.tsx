"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Dialog({ open, onOpenChange: _onOpenChange, children }: { open: boolean, onOpenChange?: (open: boolean) => void, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`bg-card-bg text-foreground rounded-lg shadow-lg p-6 w-full max-w-md relative border border-border-theme ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`text-sm text-muted-foreground text-muted-theme ${className}`}>{children}</div>;
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const hasJustify = className.includes("justify-");
  return (
    <div className={`flex flex-col-reverse sm:flex-row ${!hasJustify ? "sm:justify-end sm:space-x-2" : ""} ${className}`}>
      {children}
    </div>
  );
}
