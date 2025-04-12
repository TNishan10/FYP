export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail)\.com$/i;

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  if (!/[@$!%*?&#]/.test(password))
    return "Password must contain at least one special character";
  return "";
};

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!EMAIL_PATTERN.test(email))
    return "Only gmail.com, yahoo.com, and hotmail.com emails are allowed";
  return "";
};
