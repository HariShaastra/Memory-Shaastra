import React from 'react';
import { motion } from 'motion/react';

interface MaanasMascotProps {
  expression?: 'idle' | 'happy' | 'sad' | 'focused' | 'proud' | 'encouraging';
  size?: number | string;
  className?: string;
}

export const MaanasMascot: React.FC<MaanasMascotProps> = ({ 
  expression = 'idle', 
  size = 200,
  className = "" 
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Warm Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[110%] h-[110%] rounded-full bg-orange-400/20 blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-full h-full relative"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
          {/* Head - Simple Cute Circle */}
          <circle cx="50" cy="35" r="22" fill="#ffe4d6" />
          
          {/* Ears */}
          <circle cx="28" cy="38" r="4" fill="#ffe4d6" />
          <circle cx="72" cy="38" r="4" fill="#ffe4d6" />

          {/* Body / Robes - Orange draped style */}
          <path 
            d="M28,55 Q50,45 72,55 L75,85 Q50,95 25,85 Z" 
            fill="#f97316" 
          />
          
          {/* Saffron Sash (Diagonal Drapery) */}
          <path 
            d="M30,55 Q50,48 70,55 L70,85 Q50,80 30,85 Z" 
            fill="#ea580c" 
            opacity="0.8"
          />

          {/* Face - Keeping it very simple and welcoming */}
          <g className="transition-all duration-300">
            {/* Eyes - Smiling / Closed for peace */}
            {expression === 'sad' ? (
              <>
                <path d="M40,35 Q44,39 48,35" fill="none" stroke="#6b21a8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M52,35 Q56,39 60,35" fill="none" stroke="#6b21a8" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <motion.path 
                  d="M40,35 Q44,31 48,35" fill="none" stroke="#4a2c1d" strokeWidth="1.5" strokeLinecap="round"
                  animate={expression === 'focused' ? { d: "M40,35 Q44,35 48,35" } : {}}
                />
                <motion.path 
                  d="M52,35 Q56,31 60,35" fill="none" stroke="#4a2c1d" strokeWidth="1.5" strokeLinecap="round"
                  animate={expression === 'focused' ? { d: "M52,35 Q56,35 60,35" } : {}}
                />
              </>
            )}

            {/* Mouth - Gentle Smile */}
            <path 
              d={expression === 'happy' || expression === 'encouraging' || expression === 'proud' ? "M42,46 Q50,52 58,46" : "M45,46 Q50,50 55,46"} 
              fill="none" 
              stroke="#4a2c1d" 
              strokeWidth={expression === 'happy' || expression === 'encouraging' ? "2" : "1.5"} 
              strokeLinecap="round"
              className={expression === 'sad' ? 'opacity-0' : 'opacity-100'} 
            />
            {expression === 'sad' && (
              <path d="M46,48 Q50,45 54,48" fill="none" stroke="#4a2c1d" strokeWidth="1" strokeLinecap="round" />
            )}
            
            {/* Third Eye / Wisdom Bindi (Red for tradition/focus) */}
            <circle cx="50" cy="22" r="1.5" fill="#e11d48" opacity="0.6" />
          </g>

          {/* Hands - Folded in front */}
          <path d="M40,70 Q50,75 60,70" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
};
