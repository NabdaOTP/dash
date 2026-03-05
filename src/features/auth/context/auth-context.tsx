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
  // document.cookie = `nadba-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `nadba-token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function setInstanceTokenCookie(token: string) {
  // document.cookie = `nadba-instance-token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
  document.cookie = `nadba-instance-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeTokenCookie() {
  document.cookie = "nadba-token=; path=/; max-age=0";
  document.cookie = "nadba-instance-token=; path=/; max-age=0";
}

function saveToken(token: string) {
  localStorage.setItem("nadba-token", token);
  setTokenCookie(token);
}

/** Store instance-scoped token (from select-instance). */
function saveInstanceToken(token: string, instanceId: string) {
  localStorage.setItem("nadba-instance-token", token);
  localStorage.setItem("nadba-instance", instanceId);
  setInstanceTokenCookie(token);
}

function clearAuth() {
  localStorage.removeItem("nadba-token");
  localStorage.removeItem("nadba-instance");
  localStorage.removeItem("nadba-instance-token");
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
    const storedInstanceToken = localStorage.getItem("nadba-instance-token");

    if (storedToken) {
      setToken(storedToken);
      setTokenCookie(storedToken);
      if (storedInstance) setSelectedInstanceId(storedInstance);
      if (storedInstanceToken) {
        setInstanceTokenCookie(storedInstanceToken);
      }

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

  // const login = useCallback(async (data: LoginRequest) => {
  //   const response = await authService.login(data);
  //   const accessToken = response.accessToken || (response as unknown as Record<string, string>).access_token;
  //   if (!accessToken) {
  //     throw new Error("No access token in login response");
  //   }
  //   saveToken(accessToken);
  //   setToken(accessToken);

  //   if (response.user) {
  //     setUser(response.user);
  //   } else {
  //     // Some APIs don't return user in login response — fetch separately
  //     const userData = await authService.getMe();
  //     setUser(userData);
  //   }
  //   return response;
  // }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);

    if ((response as Record<string, unknown>)?.requires2fa) {
      return response;
    }

    const accessToken = response.accessToken || (response as unknown as Record<string, string>).access_token;
    if (!accessToken) {
      throw new Error("No access token in login response");
    }
    saveToken(accessToken);
    setToken(accessToken);

    if (response.user) {
      setUser(response.user);
    } else {
      const userData = await authService.getMe();
      setUser(userData);
    }
    return response;
  }, []);
  const register = useCallback(async (data: RegisterRequest) => {
    return authService.register(data);
  }, []);

  // const verifyOtp = useCallback(async (data: VerifyOtpRequest) => {
  //   const response = await authService.verifyOtp(data);
  //   setToken(response.accessToken);
  //   setUser(response.user);
  //   saveToken(response.accessToken);
  // }, []);
  const verifyOtp = useCallback(async (data: VerifyOtpRequest) => {
  const response = await authService.verifyOtp(data);
  if (response.accessToken) {  // ✅ check before usage
    setToken(response.accessToken);
    saveToken(response.accessToken);
  }
  if (response.user) {
    setUser(response.user);
  }
}, []);

  // const selectInstance = useCallback(
  //   async (data: SelectInstanceRequest) => {
  //     await authService.selectInstance(data);
  //     setSelectedInstanceId(data.instanceId);
  //     localStorage.setItem("nadba-instance", data.instanceId);
  //   },
  //   []
  // );

  const selectInstance = useCallback(
    async (data: SelectInstanceRequest) => {
      const response = await authService.selectInstance(data);
      const accessToken = response?.accessToken ?? (response as unknown as Record<string, string>)?.access_token;
      if (accessToken) {
        saveInstanceToken(accessToken, data.instanceId);
      }
      setSelectedInstanceId(data.instanceId);
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
