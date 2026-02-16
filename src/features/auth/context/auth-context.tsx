"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  SelectInstanceRequest,
} from "../types";
import * as authService from "../services/auth-service";

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<authService.LoginResponse>;
  register: (data: RegisterRequest) => Promise<authService.RegisterResponse>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<void>;
  selectInstance: (data: SelectInstanceRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setTokenCookie(token: string) {
  document.cookie = `nadba-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeTokenCookie() {
  document.cookie = "nadba-token=; path=/; max-age=0";
}

function saveToken(token: string) {
  localStorage.setItem("nadba-token", token);
  setTokenCookie(token);
}

function clearAuth() {
  localStorage.removeItem("nadba-token");
  localStorage.removeItem("nadba-instance");
  removeTokenCookie();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("nadba-token");
    const storedInstance = localStorage.getItem("nadba-instance");

    if (storedToken) {
      setToken(storedToken);
      setTokenCookie(storedToken);
      if (storedInstance) setSelectedInstanceId(storedInstance);

      authService
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          clearAuth();
          setToken(null);
          setSelectedInstanceId(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    const accessToken = response.accessToken || (response as unknown as Record<string, string>).access_token;
    if (!accessToken) {
      throw new Error("No access token in login response");
    }
    saveToken(accessToken);
    setToken(accessToken);

    if (response.user) {
      setUser(response.user);
    } else {
      // Some APIs don't return user in login response — fetch separately
      const userData = await authService.getMe();
      setUser(userData);
    }
    return response;
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    return authService.register(data);
  }, []);

  const verifyOtp = useCallback(async (data: VerifyOtpRequest) => {
    const response = await authService.verifyOtp(data);
    setToken(response.accessToken);
    setUser(response.user);
    saveToken(response.accessToken);
  }, []);

  const selectInstance = useCallback(
    async (data: SelectInstanceRequest) => {
      await authService.selectInstance(data);
      setSelectedInstanceId(data.instanceId);
      localStorage.setItem("nadba-instance", data.instanceId);
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API call fails
    }
    setUser(null);
    setToken(null);
    setSelectedInstanceId(null);
    clearAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await authService.getMe();
    setUser(userData);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      instances: [],
      selectedInstanceId,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      verifyOtp,
      selectInstance,
      logout: handleLogout,
      refreshUser,
    }),
    [user, token, selectedInstanceId, isLoading, login, register, verifyOtp, selectInstance, handleLogout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
