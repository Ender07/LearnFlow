import React from 'react';

// Comprehensive validation utilities for forms

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  minLength: (min) => (value, fieldName = 'This field') => {
    if (!value) return null;
    return value.length >= min ? null : `${fieldName} must be at least ${min} characters`;
  },

  maxLength: (max) => (value, fieldName = 'This field') => {
    if (!value) return null;
    return value.length <= max ? null : `${fieldName} must be no more than ${max} characters`;
  },

  number: (value) => {
    if (!value) return null;
    return !isNaN(value) && !isNaN(parseFloat(value)) ? null : 'Please enter a valid number';
  },

  positiveNumber: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Please enter a valid number';
    return num > 0 ? null : 'Please enter a positive number';
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  phoneNumber: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : 'Please enter a valid phone number';
  }
};

export const createValidator = (...validatorFunctions) => {
  return (value, fieldName) => {
    for (const validator of validatorFunctions) {
      const error = validator(value, fieldName);
      if (error) return error;
    }
    return null;
  };
};

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;
    
    if (typeof rule === 'function') {
      return rule(value, name);
    }
    
    if (Array.isArray(rule)) {
      for (const validator of rule) {
        const error = validator(value, name);
        if (error) return error;
      }
    }
    
    return null;
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const setFieldTouched = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const reset = (newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};