const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9]{10,15}$/;

export const validateLogin = (v) => {
  const e = {};
  if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!v.password) e.password = 'Password is required';
  return e;
};

export const validateRegister = (v) => {
  const e = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
  if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!PHONE.test(v.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter 10-15 digits, optional leading +';
  if (!v.country) e.country = 'Select your country';
  if (!v.role) e.role = 'Select your role';
  if (v.interests.length < 1) e.interests = 'Select at least one interest';
  if (v.notifications.length < 1) e.notifications = 'Select at least one channel';
  const p = v.password;
  if (p.length < 8) e.password = 'Use at least 8 characters';
  else if (!/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/\d/.test(p) || !/[^A-Za-z0-9]/.test(p))
    e.password = 'Include upper, lower, number and special character';
  if (v.confirmPassword !== p) e.confirmPassword = 'Passwords do not match';
  if (!v.terms) e.terms = 'You must accept the terms';
  return e;
};

export const validateTodo = (v) => {
  const e = {};
  if (v.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
  else if (v.title.length > 120) e.title = 'Title must be 120 characters or fewer';
  if (v.description.length > 500) e.description = 'Description must be 500 characters or fewer';
  return e;
};

export const errMsg = (err) => err?.response?.data?.message || err?.message || 'Something went wrong';
export const fieldErrors = (err) => err?.response?.data?.errors || {};


export function getCookie(name) {
  // Split the cookies string into individual pairs
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    // Remove leading and trailing whitespace
    cookie = cookie.trim();
    
    // Check if this cookie starts with the name we want
    if (cookie.startsWith(name + '=')) {
      // Extract and decode the value
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  // Return null if the cookie wasn't found
  return null;
}
