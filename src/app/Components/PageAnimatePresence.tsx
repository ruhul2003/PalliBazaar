"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageAnimatePresence({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dynamic route-based transitions
  const getPageVariants = () => {
    if (pathname === "/") {
      // Landing page: Smooth slide-up rise
      return {
        initial: { opacity: 0, y: 25 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -25 },
        transition: { duration: 0.32, ease: "easeOut" }
      } as const;
    } else if (pathname === "/shop") {
      // Shop: Left-to-Right slide entry
      return {
        initial: { opacity: 0, x: -25 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 25 },
        transition: { duration: 0.3, ease: "easeInOut" }
      } as const;
    } else if (pathname === "/about") {
      // About page: Elastic scale-up
      return {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration: 0.35, ease: [0.34, 1.3, 0.64, 1] }
      } as const;
    } else if (pathname === "/contact") {
      // Contact: Right-to-Left slide entry
      return {
        initial: { opacity: 0, x: 25 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -25 },
        transition: { duration: 0.3, ease: "easeInOut" }
      } as const;
    } else if (pathname === "/analyzer") {
      // Analyzer page: Elegant blur & focus fade
      return {
        initial: { opacity: 0, filter: "blur(6px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(6px)" },
        transition: { duration: 0.28, ease: "easeOut" }
      } as const;
    } else {
      // Standard pages (cart, dashboards, checkout, login): Standard quick fade
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeInOut" }
      } as const;
    }
  };

  const currentVariants = getPageVariants();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={currentVariants.initial}
        animate={currentVariants.animate}
        exit={currentVariants.exit}
        transition={currentVariants.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
