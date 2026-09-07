import React from 'react';
import { Sparkles } from 'lucide-react';

interface GroceryBasketIllustrationProps {
  className?: string;
  size?: number;
}

export const GroceryBasketIllustration: React.FC<GroceryBasketIllustrationProps> = ({
  className = '',
  size = 80,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* 1. Ambient Warm Emerald & Golden Glow behind basket */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/25 via-emerald-400/30 to-teal-300/20 rounded-full blur-xl scale-125 opacity-70 group-hover:opacity-100 group-hover:scale-135 transition-all duration-300" />

      {/* 2. Glassmorphic pill container */}
      <div className="relative w-full h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_8px_20px_rgba(0,0,0,0.2)] p-1.5 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
        
        {/* Crisp, Custom Multi-Layered Grocery Basket SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
        >
          {/* Defs for gradients and filters */}
          <defs>
            {/* Basket Body Gradient */}
            <linearGradient id="basketWoodGrad" x1="20" y1="50" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* Basket Handle Gradient */}
            <linearGradient id="handleGrad" x1="30" y1="20" x2="70" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Carrot Gradient */}
            <linearGradient id="carrotGrad" x1="55" y1="20" x2="72" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Leaf Greens Gradient */}
            <linearGradient id="leafGrad" x1="25" y1="25" x2="45" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Baguette / Bread Gradient */}
            <linearGradient id="breadGrad" x1="25" y1="15" x2="40" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Bottle / Dairy Gradient */}
            <linearGradient id="bottleGrad" x1="42" y1="22" x2="56" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>

          {/* 1. Basket Handle (drawn behind items) */}
          <path
            d="M 28 55 C 28 22, 72 22, 72 55"
            stroke="url(#handleGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 31 52 C 31 27, 69 27, 69 52"
            stroke="#FEF3C7"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* 2. Baguette / Loaf tilted left */}
          <g transform="rotate(-18 32 36)">
            <rect x="27" y="16" width="13" height="36" rx="6.5" fill="url(#breadGrad)" />
            {/* Crust cuts */}
            <path d="M 29 23 Q 33 25 38 22" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 29 29 Q 34 31 39 28" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 30 35 Q 34 37 38 34" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* 3. Milk / Dairy Carton in middle */}
          <rect x="42" y="24" width="14" height="28" rx="3" fill="url(#bottleGrad)" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M 44 24 L 46 19 L 52 19 L 54 24 Z" fill="#38BDF8" />
          <circle cx="49" cy="35" r="3.5" fill="#38BDF8" opacity="0.8" />

          {/* 4. Fresh Crisp Carrot tilted right */}
          <g transform="rotate(14 62 38)">
            {/* Green carrot top */}
            <path d="M 61 14 C 59 8, 55 12, 59 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <path d="M 62 13 C 63 6, 67 9, 63 18" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
            <path d="M 63 14 C 67 8, 70 12, 64 18" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            {/* Carrot cone */}
            <path
              d="M 58 19 C 65 18, 66 21, 65 24 L 62 48 C 61.5 50, 60.5 50, 60 48 L 57 24 C 56 21, 56 19, 58 19 Z"
              fill="url(#carrotGrad)"
            />
            {/* Carrot texture stripes */}
            <path d="M 58 26 Q 61 27 63 26" stroke="#C2410C" strokeWidth="1" strokeLinecap="round" />
            <path d="M 58.5 32 Q 61 33 62.5 32" stroke="#C2410C" strokeWidth="1" strokeLinecap="round" />
            <path d="M 59 38 Q 61 39 62 38" stroke="#C2410C" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* 5. Fresh Leafy Herb / Salad sprigs */}
          <path
            d="M 24 45 C 20 35, 30 30, 36 38 C 42 32, 48 38, 44 46 Z"
            fill="url(#leafGrad)"
          />
          <path d="M 28 39 Q 34 37 38 42" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" />

          {/* 6. Red Fresh Apple / Tomato */}
          <circle cx="68" cy="46" r="8" fill="#EF4444" />
          <path d="M 67 40 C 67 37, 69 36, 71 37" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="66" cy="43" rx="2" ry="3" fill="#FCA5A5" opacity="0.6" transform="rotate(-30 66 43)" />

          {/* 7. Woven Basket Body (Front) */}
          <path
            d="M 18 48 L 24 82 C 25 87, 28 89, 34 89 L 66 89 C 72 89, 75 87, 76 82 L 82 48 C 83 45, 80 43, 76 43 L 24 43 C 20 43, 17 45, 18 48 Z"
            fill="url(#basketWoodGrad)"
          />

          {/* Basket Top Rim */}
          <rect x="18" y="42" width="64" height="6" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <rect x="20" y="43" width="60" height="2" rx="1" fill="#FEF3C7" opacity="0.8" />

          {/* Basket Weave Lines */}
          <g stroke="#78350F" strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
            {/* Horizontal weave rows */}
            <path d="M 22 55 Q 50 58 78 55" />
            <path d="M 24 64 Q 50 67 76 64" />
            <path d="M 26 73 Q 50 76 74 73" />
            <path d="M 29 82 Q 50 84 71 82" />

            {/* Vertical criss-cross ribs */}
            <path d="M 33 48 L 36 88" />
            <path d="M 44 48 L 45 88" />
            <path d="M 56 48 L 55 88" />
            <path d="M 67 48 L 64 88" />
          </g>

          {/* Highlight Specular Glint */}
          <ellipse cx="30" cy="52" rx="6" ry="1.5" fill="#FEF3C7" opacity="0.5" transform="rotate(-8 30 52)" />
        </svg>

        {/* Specular glass reflection on top half */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl opacity-80" />
      </div>

      {/* 3. Floating Golden Sparkle Badge */}
      <div className="absolute -top-1.5 -right-1.5 flex items-center gap-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-[#0F3D2E] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.25)] border border-white/90 tracking-wide z-20 group-hover:rotate-6 transition-transform">
        <Sparkles className="w-2.5 h-2.5 fill-[#0F3D2E] stroke-[1.5]" />
        <span className="text-[9px] uppercase font-bold leading-none">Fresh</span>
      </div>
    </div>
  );
};
