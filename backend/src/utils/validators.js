import validator from 'validator';
import config from '../config/constants.js';

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  if (password.length < config.PASSWORD_MIN_LENGTH) {
    return false;
  }
  return config.PASSWORD_REGEX.test(password);
};

export const validateRegistration = (data) => {
  const errors = {};

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (data.role && !['YOUTH', 'EMPLOYER', 'ADMIN'].includes(data.role)) {
    errors.role = 'Invalid role specified';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};