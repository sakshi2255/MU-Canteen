import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../models/user';
import { ServiceProvider, isDemoMode } from '../services/serviceProvider';
import { demoStorage } from '../services/demo/demoStorage';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    const init = async () => {
      try {
        await demoStorage.init();
        const cur = demoStorage.getCurrentUser();
        if (cur) {
          setUser(cur);
        }
        unsubscribe = demoStorage.subscribe(() => {
          const updated = demoStorage.getCurrentUser();
          if (updated) setUser(updated);
        });
      } catch (err) {
        console.warn('Auth init err:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await ServiceProvider.auth.login(email, pass);
      await demoStorage.setCurrentUser(u);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const u = await ServiceProvider.auth.register(email, pass, name, role);
      await demoStorage.setCurrentUser(u);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await ServiceProvider.auth.logout();
      await demoStorage.setCurrentUser(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const u = await ServiceProvider.auth.switchRole(targetRole);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    const u = demoStorage.getCurrentUser();
    if (u) setUser(u);
  };

  const role: UserRole = user?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isDemoMode,
        login,
        register,
        logout,
        switchDemoRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
