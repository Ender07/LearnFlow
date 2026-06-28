import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const BrandContext = createContext({ brand: null, isLoading: true, refetch: () => {} });

export function useBrand() {
  return useContext(BrandContext);
}

const DEFAULTS = {
  primary_color:   '#4F46E5',
  secondary_color: '#6366F1',
  company_name:    'LearnFlow',
  logo_url:        null,
};

function applyBrandToCss(brand) {
  const merged = { ...DEFAULTS, ...brand };
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', merged.primary_color);
  root.style.setProperty('--brand-secondary', merged.secondary_color);

  // Parse hex for rgba usage
  const hex = merged.primary_color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  root.style.setProperty('--brand-primary-rgb', `${r},${g},${b}`);
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