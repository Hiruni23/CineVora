require('dotenv').config();

const PLACEHOLDER_VALUES = new Set([
  'your-email@gmail.com',
  'your-app-password',
]);

const hasValidValue = (value) => {
  return typeof value === 'string' && value.trim() && !PLACEHOLDER_VALUES.has(value.trim());
};

const getGmailAuth = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!hasValidValue(user) || !hasValidValue(pass)) {
    throw new Error(
      'Missing Gmail credentials. Set EMAIL_USER to your Gmail address and EMAIL_PASS to a Google App Password in backend/.env.'
    );
  }

  return { user: user.trim(), pass: pass.trim() };
};

module.exports = { getGmailAuth };