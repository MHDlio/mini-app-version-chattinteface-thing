import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: 'admin' | 'editor' | 'user';
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      inApp: boolean;
      marketing: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      setAuthState({ user, isLoading: false, error: null });
      localStorage.setItem('authToken', user.token);
      
      return user;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
    } finally {
      localStorage.removeItem('authToken');
      setAuthState({ user: null, isLoading: false, error: null });
    }
  }, []);

  const updateUserPreferences = useCallback(async (preferences: Partial<User['preferences']>) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Replace with actual API call
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const updatedUser = await response.json();
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));

      return updatedUser;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthState({ user: null, isLoading: false, error: null });
        return;
      }

      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const user = await response.json();
        setAuthState({ user, isLoading: false, error: null });
      } catch (error) {
        localStorage.removeItem('authToken');
        setAuthState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    };

    checkAuth();
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    updateUserPreferences,
  };
}
