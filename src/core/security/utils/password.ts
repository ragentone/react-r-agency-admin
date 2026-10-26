/** Same rules as the runtime (8–64 characters, letters and digits). */
export const passwordValid = (password: string) =>
  password.length >= 8 && password.length <= 64 && /[A-Za-z]/.test(password) && /\d/.test(password);
