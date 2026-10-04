import React from 'react';

/**
 * AA-Compliant Branding Assets for Kobbi Labs
 * All colors are selected for high contrast (4.5:1 minimum)
 */

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 400 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Background Glow */}
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="bluePink" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
    </defs>

    {/* The "K" Mark */}
    <g filter="url(#glow)">
      {/* Left slab */}
      <path 
        d="M100 100 L160 100 L160 300 L100 300 Z" 
        fill="#3b82f6" 
        fillOpacity="0.9"
      />
      {/* Top right slab */}
      <path 
        d="M170 100 L300 100 L200 200 L170 200 Z" 
        fill="#3b82f6" 
      />
      {/* Bottom right slab */}
      <path 
        d="M200 200 L300 300 L170 300 L170 200 Z" 
        fill="#d946ef" 
      />
      {/* Accent pixels */}
      <rect x="310" y="100" width="20" height="20" fill="#3b82f6" />
      <rect x="340" y="100" width="20" height="20" fill="#3b82f6" />
      <rect x="340" y="130" width="20" height="20" fill="#d946ef" />
    </g>

    {/* Text is usually handled separately for accessibility, 
        but we provide a full mark version for image-only use cases */}
  </svg>
);

export const IconBuild: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    <circle cx="12" cy="12" r="1" fill="#3b82f6" />
  </svg>
);

export const IconDevelop: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" stroke="#d946ef" />
  </svg>
);

export const IconDeliver: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
    <polyline points="7.5 19.79 7.5 14.6 3 12" />
    <polyline points="21 12 16.5 14.6 16.5 19.79" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" stroke="#3b82f6" />
  </svg>
);
