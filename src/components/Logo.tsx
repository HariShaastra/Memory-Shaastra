import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ size?: number; className?: string; showText?: boolean }> = ({ size = 48, className = "", showText = false }) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M10,80 Q50,0 90,80 L80,80 Q50,20 20,80 Z" 
            fill="url(#logoGradient)"
          />
          
          <motion.circle 
            cx="50" cy="50" r="12" 
            fill="#fff" 
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
              filter: ["blur(2px)", "blur(0px)", "blur(2px)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter italic font-display text-orange-100 leading-none">
            MEMORY <span className="text-orange-500">SHAASTRA</span>
          </h1>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-400/60 mt-1">
            Boost your Memory
          </p>
        </div>
      )}
    </div>
  );
};
