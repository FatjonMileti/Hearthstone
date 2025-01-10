import * as yup from 'yup';

export const strongPasswordValidator = yup
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(32, 'Password must not exceed 32 characters')
  .test('password-strength', 'Password must contain uppercase letter, number, and symbol', (value) => {
    if (!value) return false;
    return /[A-Z]/.test(value) && /\d/.test(value) && /[!@#$%^&*()\-=_+[\]{}|\\;:'",.<>?/]/.test(value);
  })
  .required('Password is required');
