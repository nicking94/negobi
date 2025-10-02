// hooks/users/useProfile.ts
import { useState, useEffect } from "react";
import { UsersService, UserProfile } from "@/services/users/users.service";
import { toast } from "sonner";

const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const getProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data } = await UsersService.getProfile();

      if (data.success && data.data) {
        setProfile(data.data);
        return data.data;
      } else {
        throw new Error("Estructura de respuesta inválida");
      }
    } catch (error: any) {
      console.error("Error al obtener perfil:", error);
      const errorMessage =
        error.response?.data?.message || "Error al cargar el perfil";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);

      if (!profile?.id) {
        throw new Error("ID de usuario no disponible");
      }

      const { data } = await UsersService.updateProfile({
        ...profileData,
        id: profile.id,
      });

      if (data.success && data.data) {
        setProfile(data.data);
        toast.success("Perfil actualizado correctamente");
        return { success: true, data: data.data };
      } else {
        throw new Error("Estructura de respuesta inválida");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar el perfil";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string, legalTaxId: string) => {
    try {
      setLoading(true);

      const { data } = await UsersService.changePassword({
        new_password: newPassword,
        legal_tax_id: legalTaxId,
      });

      if (data.success) {
        toast.success("Contraseña actualizada correctamente");
        return { success: true };
      } else {
        throw new Error(data.message || "Error al cambiar la contraseña");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al cambiar la contraseña";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return {
    profile,
    loading,
    loadingProfile,
    getProfile,
    updateProfile,
    changePassword,
  };
};

export default useProfile;
