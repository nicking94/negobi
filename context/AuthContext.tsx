// context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NEGOBI_JWT_TOKEN, NEGOBI_JWT_REFRESH_TOKEN } from "@/utils/constants";
import api from "@/utils/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    legal_tax_id?: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para decodificar el token JWT
  const decodeToken = (token: string): User | null => {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      return {
        id:
          decodedPayload.sub ||
          decodedPayload.id ||
          decodedPayload.userId ||
          "",
        email: decodedPayload.email || "",
        name:
          decodedPayload.name ||
          decodedPayload.username ||
          decodedPayload.email?.split("@")[0] ||
          "Usuario",
        role: decodedPayload.role || decodedPayload.scope || "user",
      };
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  };

  // Función para obtener información del usuario desde el backend
  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      // Si tu backend tiene un endpoint para obtener el perfil del usuario, úsalo aquí
      // const response = await api.get('/api/auth/profile');
      // return response.data.data;

      // Por ahora, usamos la decodificación del token
      const token = localStorage.getItem(NEGOBI_JWT_TOKEN);
      return token ? decodeToken(token) : null;
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      return null;
    }
  };

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(NEGOBI_JWT_TOKEN);

        if (token) {
          const userProfile = await fetchUserProfile();
          if (userProfile) {
            setUser(userProfile);
          } else {
            // Si no se puede obtener el perfil, intentar refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para refrescar el token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem(NEGOBI_JWT_REFRESH_TOKEN);

      if (!refreshToken) {
        return false;
      }

      // Hacer refresh usando tu interceptor de axios
      const response = await api.get("/api/auth/refresh", {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.status === 200 && response.data.success) {
        const { access_token, refresh_token } = response.data.data;

        localStorage.setItem(NEGOBI_JWT_TOKEN, access_token);
        localStorage.setItem(NEGOBI_JWT_REFRESH_TOKEN, refresh_token);

        // Actualizar usuario con el nuevo token
        const decodedUser = decodeToken(access_token);
        if (decodedUser) {
          setUser(decodedUser);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error refrescando token:", error);
      return false;
    }
  };

  // Función de login - ACTUALIZADA para no lanzar error
  const login = async (
    email: string,
    password: string,
    legal_tax_id?: string
  ) => {
    try {
      setIsLoading(true);

      // Usar tu servicio AuthService existente
      const { AuthService } = await import("@/services/auth/auth.service");

      // Crear el objeto de login según LoginType
      const loginData = {
        email,
        password,
        legal_tax_id: legal_tax_id || "",
      };

      const response = await AuthService.loginAction(loginData);

      if (response.status === 200) {
        const { access_token, refresh_token, role } = response.data.data;

        // Guardar tokens en localStorage
        localStorage.setItem(NEGOBI_JWT_TOKEN, access_token);
        if (refresh_token) {
          localStorage.setItem(NEGOBI_JWT_REFRESH_TOKEN, refresh_token);
        }

        // Actualizar usuario
        const decodedUser = decodeToken(access_token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          setUser({
            id: "1",
            email,
            name: email.split("@")[0],
            role: role || "user",
          });
        }

        return; // Éxito, no lanzar error
      } else {
        // No lanzar error aquí, dejar que useLogin maneje el error
        console.log("Login no exitoso, pero manejado por useLogin");
        return;
      }
    } catch (error: any) {
      console.error("Error en login del context:", error);
      // NO lanzar el error aquí, ya que useLogin ya lo está manejando
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(NEGOBI_JWT_TOKEN);
    localStorage.removeItem(NEGOBI_JWT_REFRESH_TOKEN);
    localStorage.removeItem("company_tax_id");
    localStorage.removeItem("user_profile");
  };

  // ⚠️ ELIMINADO: El interceptor duplicado que causaba la redirección
  // Tu interceptor principal en utils/api.ts ya maneja todo correctamente

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
