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
  login: (
    token: string,
    userData: User,
    refreshToken?: string,
    rememberMe?: boolean
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes para localStorage
const NEGOBI_JWT_TOKEN = "NEGOBI_JWT_TOKEN";
const NEGOBI_JWT_REFRESH_TOKEN = "NEGOBI_JWT_REFRESH_TOKEN";
const NEGOBI_USER_DATA = "NEGOBI_USER_DATA";
const NEGOBI_REMEMBER_ME = "NEGOBI_REMEMBER_ME";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(NEGOBI_JWT_TOKEN);
      const userData = localStorage.getItem(NEGOBI_USER_DATA);
      const rememberMe = localStorage.getItem(NEGOBI_REMEMBER_ME) === "true";

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));

          // Si no está marcado "recordar sesión", limpiar después de un tiempo
          if (!rememberMe) {
            // Establecer timeout para limpiar tokens después de 24 horas
            setTimeout(() => {
              if (localStorage.getItem(NEGOBI_REMEMBER_ME) !== "true") {
                logout();
              }
            }, 24 * 60 * 60 * 1000); // 24 horas
          }
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

  const login = (
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
