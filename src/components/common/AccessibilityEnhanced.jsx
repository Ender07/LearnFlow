import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const FocusTrap = ({ children, isActive = true }) => {
  const containerRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstFocusableRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          lastFocusableRef.current?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          firstFocusableRef.current?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return (
    <div ref={containerRef} role="dialog" aria-modal={isActive}>
      {children}
    </div>
  );
};

export const SkipLink = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {children}
  </a>
);

export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
);

export const LiveRegion = ({ 
  children, 
  priority = 'polite', 
  atomic = false,
  className = "" 
}) => (
  <div
    aria-live={priority}
    aria-atomic={atomic}
    className={`sr-only ${className}`}
  >
    {children}
  </div>
);

export const AccessibleButton = ({ 
  children, 
  onClick, 
  ariaLabel,
  ariaDescribedBy,
  isLoading = false,
  disabled = false,
  className = "",
  ...props 
}) => {
  return (
    <motion.button
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className} ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
      {isLoading && (
        <ScreenReaderOnly>Loading...</ScreenReaderOnly>
      )}
    </motion.button>
  );
};

export const KeyboardShortcuts = ({ shortcuts, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const shortcut = shortcuts.find(s => {
        const keys = s.keys.split('+');
        return keys.every(key => {
          switch (key.toLowerCase()) {
            case 'ctrl': return e.ctrlKey;
            case 'alt': return e.altKey;
            case 'shift': return e.shiftKey;
            case 'meta': return e.metaKey;
            default: return e.key.toLowerCase() === key.toLowerCase();
          }
        });
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <>
      {children}
      <ScreenReaderOnly>
        <div>
          <h3>Keyboard Shortcuts:</h3>
          <ul>
            {shortcuts.map((shortcut, index) => (
              <li key={index}>
                {shortcut.keys}: {shortcut.description}
              </li>
            ))}
          </ul>
        </div>
      </ScreenReaderOnly>
    </>
  );
};

export default {
  FocusTrap,
  SkipLink,
  ScreenReaderOnly,
  LiveRegion,
  AccessibleButton,
  KeyboardShortcuts
};