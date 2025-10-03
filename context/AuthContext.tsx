// context/AuthContext.tsx (actualizado)
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("NEGOBI_JWT_TOKEN");
      const userData = localStorage.getItem("NEGOBI_USER_DATA");

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          logout();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (token: string, userData: User, refreshToken?: string) => {
    localStorage.setItem("NEGOBI_JWT_TOKEN", token);
    if (refreshToken) {
      localStorage.setItem("NEGOBI_JWT_REFRESH_TOKEN", refreshToken);
    }
    localStorage.setItem("NEGOBI_USER_DATA", JSON.stringify(userData));
    setUser(userData);

    // Disparar evento para sincronizar otros hooks
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem("NEGOBI_JWT_TOKEN");
    localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
    localStorage.removeItem("NEGOBI_USER_DATA");
    localStorage.removeItem("NEGOBI_USER_API_KEY");
    setUser(null);

    // Disparar evento para sincronizar otros hooks
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
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
