"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-primary-light/40 border border-border-light/60 animate-pulse" />
    );
  }

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  const currentIcon =
    resolvedTheme === "dark" ? (
      <Moon className="w-4.5 h-4.5 text-accent-hover" />
    ) : (
      <Sun className="w-4.5 h-4.5 text-warning" />
    );

  return (
    <div className="relative inline-block text-left">
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary-light/60 hover:bg-primary-light dark:bg-card-white/80 dark:hover:bg-card-white border border-border-light text-text-earth shadow-xs transition-all duration-200 cursor-pointer focus:outline-none"
        aria-label="Toggle theme"
        title={`Current theme: ${theme}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            {currentIcon}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing dropdown */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-36 rounded-xl bg-card-white dark:bg-[#16241b] border border-border-light shadow-xl p-1.5 z-50 overflow-hidden"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2.5 py-1 mb-0.5 border-b border-border-light/50">
                Appearance
              </div>
              {themes.map(({ id, label, icon: Icon }) => {
                const isActive = theme === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setTheme(id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary-light text-primary dark:bg-primary/20 dark:text-accent font-bold"
                        : "text-text-earth hover:bg-bg-sand/70 dark:hover:bg-primary-light/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 opacity-80" />
                      <span>{label}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-primary dark:text-accent" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
