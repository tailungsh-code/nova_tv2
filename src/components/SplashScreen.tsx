import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    try {
      return window.sessionStorage.getItem('nova_tv_splash_shown') !== '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem('nova_tv_splash_shown', '1');
      } catch {
        // Ignore
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080B14] text-white select-none"
          aria-hidden="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-[#101827] border border-white/10 shadow-2xl shadow-[#6C5CE7]/25">
              <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none">
                <defs>
                  <linearGradient id="splash-grad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6C5CE7" />
                    <stop offset="60%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#FF365D" />
                  </linearGradient>
                </defs>
                <path
                  d="M18 14C18 11.8 20.4 10.5 22.3 11.7L50.3 29.7C52 30.8 52 33.2 50.3 34.3L22.3 52.3C20.4 53.5 18 52.2 18 50V14Z"
                  fill="url(#splash-grad)"
                />
                <circle cx="50" cy="14" r="4" fill="#FF365D" />
              </svg>
            </div>
            <div className="text-center">
              <span className="font-display text-3xl font-bold tracking-tight text-white">
                NOVA <span className="text-[#00D4FF]">TV</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
