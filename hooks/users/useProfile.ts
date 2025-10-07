// hooks/users/useProfile.ts
import { useState, useEffect } from "react";
import {
  UsersService,
  UserProfile,
  UpdateUserPayload,
  UserResponse,
} from "@/services/users/users.service";
import { ApiError } from "@/types";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setError(null);
      const response: UserResponse = await UsersService.getProfile();
      setProfile(response.data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Error al crear el usuario";
      console.error(errorMessage);
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateProfile = async (data: UpdateUserPayload) => {
    try {
      if (!profile?.id) {
        throw new Error("ID de usuario no disponible");
      }

      setLoading(true);
      setError(null);
      const response = await UsersService.updateProfile(profile.id, data);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Error al actualizar el perfil";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string, legalTaxId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsersService.changePassword({
        new_password: newPassword,
        legal_tax_id: legalTaxId,
      });
      return { success: true, data: response.data };
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Error al cambiar la contraseña";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    loadingProfile,
    error,
    updateProfile,
    changePassword,
    refetchProfile: fetchProfile,
  };
};
