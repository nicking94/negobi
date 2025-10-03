// hooks/users/useProfile.ts
import { useState, useEffect } from "react";
import {
  UsersService,
  UserProfile,
  UpdateProfileData,
} from "@/services/users/users.service";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setError(null);
      const response = await UsersService.getProfile();
      setProfile(response.data.data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError(error.response?.data?.message || "Error al cargar el perfil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      if (!profile?.id) {
        throw new Error("ID de usuario no disponible");
      }

      setLoading(true);
      setError(null);
      const response = await UsersService.updateProfile(profile.id, data);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Error al actualizar el perfil";
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
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage =
        error.response?.data?.message || "Error al cambiar contraseña";
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
