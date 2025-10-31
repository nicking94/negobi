// context/AuthContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { UsersService } from "@/services/users/users.service";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  company_id?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    token: string,
    userData: User,
    refreshToken?: string,
    rememberMe?: boolean
  ) => void;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  updateToken: (accessToken: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NEGOBI_JWT_TOKEN = "NEGOBI_JWT_TOKEN";
const NEGOBI_JWT_REFRESH_TOKEN = "NEGOBI_JWT_REFRESH_TOKEN";
const NEGOBI_USER_DATA = "NEGOBI_USER_DATA";
const NEGOBI_REMEMBER_ME = "NEGOBI_REMEMBER_ME";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem(NEGOBI_JWT_TOKEN);
      if (!token) return null;

      const response = await UsersService.getProfile();
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.id.toString(),
          email: response.data.email,
          username: response.data.username,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          phone: response.data.phone,
          role: response.data.role,
          company_id: response.data.company_id,
        };
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const updateToken = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(NEGOBI_JWT_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(NEGOBI_JWT_REFRESH_TOKEN, refreshToken);
    }

    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(NEGOBI_JWT_TOKEN);
      const userData = localStorage.getItem(NEGOBI_USER_DATA);
      const rememberMe = localStorage.getItem(NEGOBI_REMEMBER_ME) === "true";

      if (token) {
        try {
          const freshUserData = await fetchUserProfile();

          if (freshUserData) {
            setUser(freshUserData);

            localStorage.setItem(
              NEGOBI_USER_DATA,
              JSON.stringify(freshUserData)
            );
          } else if (userData) {
            setUser(JSON.parse(userData));
          }

          if (!rememberMe) {
            setTimeout(() => {
              if (localStorage.getItem(NEGOBI_REMEMBER_ME) !== "true") {
                logout();
              }
            }, 24 * 60 * 60 * 1000);
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (
    token: string,
    userData: User,
    refreshToken?: string,
    rememberMe: boolean = false
  ) => {
    localStorage.setItem(NEGOBI_JWT_TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(NEGOBI_JWT_REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(NEGOBI_USER_DATA, JSON.stringify(userData));
    localStorage.setItem(NEGOBI_REMEMBER_ME, rememberMe.toString());

    if (!rememberMe) {
      localStorage.setItem("NEGOBI_TOKEN_TIMESTAMP", Date.now().toString());
    } else {
      localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");
    }

    setUser(userData);
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem(NEGOBI_JWT_TOKEN);
    localStorage.removeItem(NEGOBI_JWT_REFRESH_TOKEN);
    localStorage.removeItem(NEGOBI_USER_DATA);
    localStorage.removeItem(NEGOBI_REMEMBER_ME);
    localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");
    localStorage.removeItem("NEGOBI_USER_API_KEY");
    setUser(null);

    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const refreshUserProfile = async () => {
    const freshUserData = await fetchUserProfile();
    if (freshUserData) {
      setUser(freshUserData);
      localStorage.setItem(NEGOBI_USER_DATA, JSON.stringify(freshUserData));
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUserProfile,
    updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
