import { useContext } from 'react';

import { AuthContext } from './auth.context.ts';

/** Access the auth state/actions provided by `AuthProvider`. */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
