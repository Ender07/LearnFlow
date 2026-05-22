import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserTheme } from '@/entities/all';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultTheme = {
  color_scheme: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B'
  },
  typography: {
    font_family: 'Inter',
    font_size: 'medium',
    line_height: 1.5
  },
  accessibility: {
    high_contrast: false,
    reduced_motion: false,
    keyboard_navigation: true,
    screen_reader_optimized: false
  },
  layout_preferences: {
    sidebar_collapsed: false,
    dashboard_layout: 'grid',
    animation_level: 'full'
  }
};

export function ThemeProvider({ children, userId }) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserTheme();
  }, [userId]);

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  const loadUserTheme = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const userThemes = await UserTheme.filter({ user_id: userId, is_active: true });
      if (userThemes.length > 0) {
        setCurrentTheme({
          ...defaultTheme,
          ...userThemes[0]
        });
      }
    } catch (error) {
      console.error('Error loading user theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeToDocument = (theme) => {
    const root = document.documentElement;
    
    // Apply color scheme
    Object.entries(theme.color_scheme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', theme.typography.font_family);
    root.style.setProperty('--font-size-base', getFontSize(theme.typography.font_size));
    root.style.setProperty('--line-height', theme.typography.line_height.toString());

    // Apply accessibility preferences
    if (theme.accessibility.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (theme.accessibility.reduced_motion) {
      root.style.setProperty('--motion-duration', '0s');
      root.classList.add('reduced-motion');
    } else {
      root.style.setProperty('--motion-duration', '0.3s');
      root.classList.remove('reduced-motion');
    }

    // Apply layout preferences
    if (theme.layout_preferences.animation_level === 'none') {
      root.classList.add('no-animations');
    } else if (theme.layout_preferences.animation_level === 'reduced') {
      root.classList.add('reduced-animations');
    } else {
      root.classList.remove('no-animations', 'reduced-animations');
    }
  };

  const getFontSize = (size) => {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px'
    };
    return sizes[size] || sizes.medium;
  };

  const updateTheme = async (updates) => {
    const newTheme = { ...currentTheme, ...updates };
    setCurrentTheme(newTheme);

    if (userId) {
      try {
        const existingThemes = await UserTheme.filter({ user_id: userId, is_active: true });
        if (existingThemes.length > 0) {
          await UserTheme.update(existingThemes[0].id, newTheme);
        } else {
          await UserTheme.create({
            user_id: userId,
            theme_name: 'Custom Theme',
            ...newTheme,
            is_active: true
          });
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const resetTheme = () => {
    setCurrentTheme(defaultTheme);
  };

  const value = {
    theme: currentTheme,
    updateTheme,
    resetTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}