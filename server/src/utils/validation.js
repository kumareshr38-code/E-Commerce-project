// Email validation
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation
const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  // At least 6 characters, can include letters, numbers, and special characters
  return password.length >= 6;
};

// Name validation
const isValidName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  // At least 2 characters, only letters and spaces
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Mobile number validation
const isValidMobile = (mobile) => {
  if (!mobile || typeof mobile !== 'string') {
    return false;
  }
  // Basic mobile validation - 10-15 digits
  const mobileRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return mobileRegex.test(mobile.trim());
};

// Validate user signup data
const validateSignupData = (data) => {
  const errors = [];

  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('First name must be 2-50 characters long and contain only letters');
  }

  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Last name must be 2-50 characters long and contain only letters');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!data.mobile || !isValidMobile(data.mobile)) {
    errors.push('Please provide a valid mobile number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate user login data
const validateLoginData = (data) => {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password || !data.password.trim()) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize user data object
const sanitizeUserData = (userData) => {
  const sanitized = {};
  
  Object.keys(userData).forEach(key => {
    if (typeof userData[key] === 'string') {
      sanitized[key] = sanitizeInput(userData[key]);
    } else {
      sanitized[key] = userData[key];
    }
  });
  
  return sanitized;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidMobile,
  validateSignupData,
  validateLoginData,
  sanitizeInput,
  sanitizeUserData
};
