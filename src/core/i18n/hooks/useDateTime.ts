import { useMemo } from 'react';

export interface IUseDateTime {
  calculateAge: (date: string | Date) => number;
}

/**
 * Calculates the age based on the provided birth date.
 * @param {Date} birthDate - The date of birth to calculate the age from.
 * @return {number} The calculated age in years.
 */
function calculateAgeFromBirthday(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const useDateTime = (): IUseDateTime => {
  return useMemo(() => {
    return {
      calculateAge: (date: string | Date) => {
        return calculateAgeFromBirthday(typeof date === 'string' ? new Date(date) : date);
      },
    };
  }, []);
};

export { calculateAgeFromBirthday, useDateTime };
