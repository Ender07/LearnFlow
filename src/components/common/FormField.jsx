import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  success,
  required = false,
  placeholder,
  disabled = false,
  validation,
  options = [], // for select fields
  className = "",
  helpText,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  const handleChange = (newValue) => {
    onChange(newValue);
    
    // Real-time validation if validation function provided
    if (validation && hasBlurred) {
      validation(newValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBlurred(true);
    
    // Validate on blur
    if (validation) {
      validation(value);
    }
  };

  const fieldId = `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = error && hasBlurred;
  const hasSuccess = success && hasBlurred && value;

  const renderField = () => {
    const baseProps = {
      id: fieldId,
      value: value || '',
      onChange: (e) => handleChange(e.target.value),
      onFocus: () => setIsFocused(true),
      onBlur: handleBlur,
      placeholder,
      disabled,
      className: `transition-all duration-200 ${
        hasError 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
          : hasSuccess 
            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-200'
      } ${className}`,
      'aria-describedby': `${fieldId}-help ${fieldId}-error`,
      'aria-invalid': hasError,
      ...props
    };

    switch (type) {
      case 'textarea':
        return <Textarea {...baseProps} />;
      case 'select':
        return (
          <Select value={value} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger className={baseProps.className} id={fieldId}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem 
                  key={typeof option === 'string' ? option : option.value} 
                  value={typeof option === 'string' ? option : option.value}
                >
                  {typeof option === 'string' ? option : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input type={type} {...baseProps} />;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={fieldId}
          className={`block text-sm font-medium transition-colors duration-200 ${
            hasError ? 'text-red-700' : hasSuccess ? 'text-green-700' : 'text-slate-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {renderField()}
        
        {/* Success/Error Icons */}
        <AnimatePresence>
          {(hasError || hasSuccess) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {hasError ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p id={`${fieldId}-help`} className="text-sm text-slate-500">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            id={`${fieldId}-error`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {hasSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-green-600 flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};