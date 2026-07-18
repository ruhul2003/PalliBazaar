"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageAnimatePresence({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return static children on SSR and first mount to guarantee zero flicker
  if (!mounted) {
    return <>{children}</>;
  }

  // Only animate the 4 requested pages
  const animatedPaths = ["/contact", "/analyzer", "/items/add", "/items/manage"];
  const shouldAnimate = animatedPaths.includes(pathname);

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  const getPageVariants = () => {
    switch (pathname) {
      case "/contact":
        // Contact: Smooth slide-up fade
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration: 0.28, ease: "easeOut" }
        } as const;
      case "/analyzer":
        // Analyzer: Elegant blur & focus
        return {
          initial: { opacity: 0, filter: "blur(5px)" },
          animate: { opacity: 1, filter: "blur(0px)" },
          exit: { opacity: 0, filter: "blur(5px)" },
          transition: { duration: 0.28, ease: "easeOut" }
        } as const;
      case "/items/add":
        // Add Product: Scale-up zoom transition
        return {
          initial: { opacity: 0, scale: 0.985 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.985 },
          transition: { duration: 0.26, ease: "easeOut" }
        } as const;
      case "/items/manage":
        // Manage Listings: Slide in from the left
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
          transition: { duration: 0.28, ease: "easeInOut" }
        } as const;
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0.1 }
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
