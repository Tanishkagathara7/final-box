import { createContext, useContext, useEffect, useState } from "react";
import {
  authApi,
  setAuthToken,
  removeAuthToken,
  setUser,
  getUser,
} from "@/lib/api";
import { toast } from "sonner";

// API Response types
interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  tempToken?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  location?: {
    cityId: string;
    cityName: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing: boolean;
    };
    language?: string;
    currency?: string;
    darkMode?: boolean;
    defaultLocation?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  loginWithOTP: (email: string, otp: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ tempToken: string }>;
  verifyRegistration: (
    email: string,
    otp: string,
    tempToken: string,
  ) => Promise<void>;
  requestLoginOTP: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = getUser();
    if (savedUser) {
      setUserState(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ emailOrPhone, password });
      const data: AuthResponse = response.data || response;
      if (data.success) {
        setAuthToken(data.token!);
        setUser(data.user!);
        setUserState(data.user!);
        toast.success("Login successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOTP = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.verifyLoginOTP({ email, otp });
      const data: AuthResponse = response.data || response;
      if (data.success) {
        setAuthToken(data.token!);
        setUser(data.user!);
        setUserState(data.user!);
        toast.success("Login successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      const resData: AuthResponse = response.data || response;
      if (resData.success) {
        toast.success("OTP sent to your email!");
        return { tempToken: resData.tempToken };
      }
      throw new Error(resData.message);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRegistration = async (
    email: string,
    otp: string,
    tempToken: string,
  ) => {
    try {
      setIsLoading(true);
      const response = await authApi.verifyRegistration({
        email,
        otp,
        tempToken,
      });
      const data: AuthResponse = response.data || response;
      if (data.success) {
        setAuthToken(data.token!);
        setUser(data.user!);
        setUserState(data.user!);
        toast.success("Registration successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestLoginOTP = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.requestLoginOTP({ email });
      const data: AuthResponse = response.data || response;
      if (data.success) {
        toast.success("OTP sent to your email!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUserState(null);
    toast.success("Logged out successfully!");
  };

  const updateUser = (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData } as User;
    setUser(updatedUser);
    setUserState(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithOTP,
    register,
    verifyRegistration,
    requestLoginOTP,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
