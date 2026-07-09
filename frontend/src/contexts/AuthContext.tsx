import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/services';
import { setStoredTokens } from '../api/client';
import type { RoleCode, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifiant: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: RoleCode[]) => boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STAFF_ROLES: RoleCode[] = ['ADMIN', 'CHEF_SERVICE', 'TECHNICIEN'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (next: User | null) => {
    setUser(next);
    if (next) localStorage.setItem('auth_user', JSON.stringify(next));
    else localStorage.removeItem('auth_user');
  };

  useEffect(() => {
    const init = async () => {
      if (!localStorage.getItem('auth_tokens')) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authApi.profile();
        persistUser(profile);
      } catch {
        setStoredTokens(null);
        persistUser(null);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const login = useCallback(async (identifiant: string, motDePasse: string) => {
    const result = await authApi.login(identifiant, motDePasse);
    setStoredTokens(result.tokens);
    persistUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    const tokens = localStorage.getItem('auth_tokens');
    const refreshToken = tokens ? (JSON.parse(tokens) as { refreshToken?: string }).refreshToken : undefined;
    try {
      await authApi.logout(refreshToken);
    } finally {
      setStoredTokens(null);
      persistUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (...roles: RoleCode[]) => (user ? roles.includes(user.role.code) : false),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      hasRole,
      isStaff: user ? STAFF_ROLES.includes(user.role.code) : false,
    }),
    [user, loading, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
