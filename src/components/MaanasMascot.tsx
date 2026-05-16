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
          {/* Base Head - Very Circular & Cute */}
          <circle cx="50" cy="40" r="22" fill="#ffdca2" />
          
          {/* Choti (Original Style) */}
          <path 
            d="M50,18 Q52,8 56,12 Q54,18 51,17" 
            fill="#3e2723" 
          />

          {/* Saffron Body - Original Simple Arc */}
          <path 
            d="M25,95 C25,75 35,60 50,60 C65,60 75,75 75,95 Z" 
            fill="#ea580c" 
          />

          {/* Facial Features - Simple & Kind */}
          <g transform="translate(0, 2)">
            {/* Friendly Motivated Eyes */}
            <circle cx="43" cy="38" r="2.8" fill="#4a2c1d" />
            <circle cx="57" cy="38" r="2.8" fill="#4a2c1d" />
            <circle cx="44.2" cy="36.8" r="0.8" fill="white" />
            <circle cx="58.2" cy="36.8" r="0.8" fill="white" />
            
            {/* Handsome Motivating Smile */}
            <path 
              d="M41,50 Q50,55 59,50" 
              fill="none" 
              stroke="#4a2c1d" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
            
            {/* Wisdom Dot */}
            <circle cx="50" cy="24" r="1.5" fill="#be123c" opacity="0.9" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
