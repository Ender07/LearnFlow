import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const BrandContext = createContext({
  brand: null,
  isLoading: true,
  refetch: () => {},
});

export function useBrand() {
  return useContext(BrandContext);
}

// Default brand tokens — Tesla/SpaceX inspired
const DEFAULTS = {
  primary_color:    '#00D4FF',
  secondary_color:  '#7C3AED',
  background_color: '#0A0E1A',
  sidebar_color:    '#0D1117',
  company_name:     'LearnFlow',
  logo_url:         null,
};

function hexToHsl(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyBrandToCss(brand) {
  const merged = { ...DEFAULTS, ...brand };
  const root = document.documentElement;

  // Primary accent
  const primaryHsl = hexToHsl(merged.primary_color);
  const [ph, ps, pl] = primaryHsl.split(' ');
  root.style.setProperty('--accent-h', ph);
  root.style.setProperty('--accent-s', ps);
  root.style.setProperty('--accent-l', pl);
  root.style.setProperty('--brand-primary', merged.primary_color);
  root.style.setProperty('--brand-secondary', merged.secondary_color);
  root.style.setProperty('--brand-bg', merged.background_color);
  root.style.setProperty('--brand-sidebar', merged.sidebar_color);

  // Glow derived from primary
  const r = parseInt(merged.primary_color.replace('#','').slice(0,2), 16);
  const g = parseInt(merged.primary_color.replace('#','').slice(2,4), 16);
  const b = parseInt(merged.primary_color.replace('#','').slice(4,6), 16);
  root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.3)`);
  root.style.setProperty('--accent-glow-strong', `rgba(${r},${g},${b},0.5)`);
}

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrand = async () => {
    try {
      const records = await base44.entities.BrandSettings.list();
      const b = records[0] || null;
      setBrand(b);
      applyBrandToCss(b || {});
    } catch {
      applyBrandToCss({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBrand(); }, []);

  return (
    <BrandContext.Provider value={{ brand, isLoading, refetch: fetchBrand }}>
      {children}
    </BrandContext.Provider>
  );
}