"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "../api/client";

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: "EMPLOYEE" | "TRAINER" | "ADMIN";
  profile?: {
    id: number;
    employeeCode?: string;
    designation: string;
    cadre?: string;
    currentAssignment?: string;
    educationalQualification?: string;
    experienceYears: number;
    department?: {
      id: number;
      code: string;
      name: string;
    };
    jobRole?: {
      id: number;
      code: string;
      name: string;
    };
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiClient<{ success: boolean; user: UserProfile }>('/auth/me');
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    try {
      const data = await apiClient<{
        success: boolean;
        accessToken: string;
        user: UserProfile;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      if (data?.success && data?.user) {
        if (typeof window !== 'undefined' && data.accessToken) {
          localStorage.setItem('gyanivo_access_token', data.accessToken);
        }
        setUser(data.user);

        // Role-based routing
        if (data.user.systemRole === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (data.user.systemRole === 'TRAINER') {
          router.push('/trainer/dashboard');
        } else {
          router.push('/employee/dashboard');
        }

        return { success: true, role: data.user.systemRole };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gyanivo_access_token');
      }
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
