import React from 'react';

/**
 * GlassCard — shared frosted-glass card primitive.
 * Use this instead of shadcn Card on all pages to stay consistent.
 *
 * Props:
 *  accent   — stronger blue-tinted glass
 *  hover    — enables hover lift effect
 *  noPad    — skip default padding (you handle it)
 *  className — additional classes
 */
export default function GlassCard({ children, accent = false, hover = false, noPad = false, className = '', style = {}, onClick }) {
  const base = {
    background: accent
      ? 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.06) 100%)'
      : 'rgba(255,255,255,0.04)',
    border: accent
      ? '1px solid rgba(0,212,255,0.2)'
      : '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    boxShadow: accent
      ? '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.06)'
      : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
    transition: hover ? 'all 0.2s ease' : undefined,
    ...style,
  };

  return (
    <div
      className={`${noPad ? '' : ''} ${className}`}
      style={base}
      onClick={onClick}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = accent
          ? '0 12px 48px rgba(0,0,0,0.6), 0 0 80px rgba(0,212,255,0.12)'
          : '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = accent ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.14)';
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = accent
          ? '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.06)'
          : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = accent ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)';
      } : undefined}
    >
      {children}
    </div>
  );
}