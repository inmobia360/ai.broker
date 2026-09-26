'use client';

import React from 'react';
import Link from 'next/link';

export interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  href?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
}

/**
 * Inmobia 360 Official Vector Isotype
 * Torre Corporativa (#1D63FF) + Casa Residencial (#161E2E) con ventana (#FF8A00)
 * envueltos por el Anillo Orbital 360° (#00D2B4 -> #008080) y Nodo Satélite Solar (#FF8A00).
 */
export const BrandIcon: React.FC<{ className?: string; size?: number | string; idPrefix?: string }> = ({
  className = 'w-9 h-9',
  size,
  idPrefix = 'inmobia'
}) => {
  const orbitGradId = `${idPrefix}-orbitGradient`;
  const towerGradId = `${idPrefix}-towerGradient`;
  const glowId = `${idPrefix}-glow`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Inmobia 360 Isotipo Oficial"
    >
      <title>Inmobia 360</title>
      <defs>
        <linearGradient id={orbitGradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D2B4" />
          <stop offset="100%" stopColor="#1D63FF" />
        </linearGradient>
        <linearGradient id={towerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D63FF" />
          <stop offset="100%" stopColor="#0B3CB3" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00D2B4" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${glowId})`}>
        {/* 1. TORRE CORPORATIVA EN AZUL COBALTO (Crecimiento patrimonial) */}
        <path
          d="M48 18H62C63.1 18 64 18.9 64 20V76H48V18Z"
          fill={`url(#${towerGradId})`}
        />
        {/* Ventanales de la torre */}
        <rect x="52" y="24" width="3" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.8" />
        <rect x="58" y="24" width="3" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.8" />
        <rect x="52" y="32" width="3" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.8" />
        <rect x="58" y="32" width="3" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.8" />
        <rect x="52" y="40" width="3" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.8" />
        <rect x="58" y="40" width="3" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.8" />

        {/* 2. CASA RESIDENCIAL EN CARBÓN (Hogar, cercanía, estabilidad) */}
        {/* Tejado a dos aguas */}
        <path
          d="M20 54L38 38L56 54H20Z"
          fill="#161E2E"
        />
        {/* Cuerpo de la casa */}
        <path
          d="M24 53V76C24 77.1 24.9 78 26 78H50C51.1 78 52 77.1 52 76V53H24Z"
          fill="#161E2E"
        />
        {/* Ventana cuádruple en Naranja Solar (#FF8A00) */}
        <rect x="33" y="58" width="4.5" height="4.5" rx="0.5" fill="#FF8A00" />
        <rect x="39" y="58" width="4.5" height="4.5" rx="0.5" fill="#FF8A00" />
        <rect x="33" y="64" width="4.5" height="4.5" rx="0.5" fill="#FF8A00" />
        <rect x="39" y="64" width="4.5" height="4.5" rx="0.5" fill="#FF8A00" />

        {/* 3. ANILLO ORBITAL 360° (Visión envolvente, IA & Conectividad) */}
        <path
          d="M14 62C12 52 24 38 46 32C70 26 86 32 87 42C88 52 74 65 52 71C34 76 18 73 14 62Z"
          stroke={`url(#${orbitGradId})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 4. NODO SATÉLITE SOLAR (#FF8A00) */}
        <circle cx="83" cy="38" r="4.5" fill="#FF8A00" />
        <circle cx="83" cy="38" r="2" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  href = '/',
  showSubtitle = true,
  subtitleText = 'AI BROKER OS'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Isotipo */}
      <BrandIcon className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`} />

      {/* Tipografía Oficial */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center text-left leading-none">
          <div className={`font-black tracking-tight uppercase text-[#161E2E] ${titleSizes[size]}`}>
            <span>INMOBIA</span>{' '}
            <span className="text-[#FF8A00]">
              360
            </span>
          </div>

          {(variant === 'full' || showSubtitle) && (
            <span
              className={`font-semibold tracking-wider uppercase text-slate-600 mt-1 ${subtitleSizes[size]}`}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Inmobia 360 - Inicio" className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export const LogoFull: React.FC<Omit<BrandLogoProps, 'variant'>> = (props) => (
  <BrandLogo variant="full" {...props} />
);

export const LogoCompact: React.FC<Omit<BrandLogoProps, 'variant'>> = (props) => (
  <BrandLogo variant="compact" showSubtitle={false} {...props} />
);

export const LogoIcon: React.FC<Omit<BrandLogoProps, 'variant'>> = (props) => (
  <BrandLogo variant="icon" {...props} />
);

export default BrandLogo;

