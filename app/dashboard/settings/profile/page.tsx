"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Save,
  Key,
  Eye,
  EyeOff,
  Building,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { Toaster, toast } from "sonner";
import useProfile from "@/hooks/users/useProfile";

const ProfilePage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [activeSection, setActiveSection] = useState("profile");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { profile, loading, loadingProfile, updateProfile, changePassword } =
    useProfile();

  // Datos del usuario desde el hook
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    username: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [taxIdInput, setTaxIdInput] = useState("");

  // Actualizar userData cuando el perfil se carga
  useEffect(() => {
    if (profile) {
      setUserData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        username: profile.username || "",
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateProfile(userData);

    if (result.success) {
      console.log("Perfil actualizado:", result.data);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones del lado del cliente
    if (!taxIdInput) {
      toast.error("Por favor ingresa el ID de tu empresa");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const result = await changePassword(passwordData.newPassword, taxIdInput);

    if (result.success) {
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
      setTaxIdInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Mostrar loading mientras se carga el perfil
  if (loadingProfile) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green_b mx-auto"></div>
              <p className="mt-4 text-gray_b">Cargando perfil...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Perfil de Usuario
            </h1>
            {profile && (
              <div className="text-sm text-gray_m">
                Rol:{" "}
                <span className="font-medium text-green_b capitalize">
                  {profile.role || "Usuario"}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray_xxl p-6">
            <div className="flex border-b border-gray_xxl mb-6">
              <button
                className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeSection === "profile"
                    ? "border-green_m text-green_b"
                    : "border-transparent text-gray_m hover:text-gray_b"
                }`}
                onClick={() => setActiveSection("profile")}
              >
                <User className="w-4 h-4" />
                Información Personal
              </button>
              <button
                className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeSection === "password"
                    ? "border-green_m text-green_b"
                    : "border-transparent text-gray_m hover:text-gray_b"
                }`}
                onClick={() => setActiveSection("password")}
              >
                <Key className="w-4 h-4" />
                Cambiar Contraseña
              </button>
            </div>

            {/* Sección de Información Personal */}
            {activeSection === "profile" && (
              <Card className="bg-white border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg font-medium">
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal aquí.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-gray_b">
                          Nombre
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                          <Input
                            id="first_name"
                            name="first_name"
                            value={userData.first_name}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-gray_b">
                          Apellido
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={userData.last_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray_b">
                          Correo Electrónico
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray_b">
                          Teléfono
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={userData.phone}
                            onChange={handleInputChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-gray_b">
                          Nombre de Usuario
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          value={userData.username}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-green_m hover:bg-green_b"
                      >
                        {loading ? (
                          "Guardando..."
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Sección de Cambio de Contraseña */}
            {activeSection === "password" && (
              <Card className="bg-white border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg font-medium">
                    Cambiar Contraseña
                  </CardTitle>
                  <CardDescription>
                    Para cambiar tu contraseña, ingresa el ID de tu empresa y tu
                    nueva contraseña.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    {/* Campo de Legal Tax ID - SIEMPRE visible */}
                    <div className="space-y-2">
                      <Label htmlFor="taxId" className="text-gray_b">
                        ID la Empresa *
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                        <Input
                          id="taxId"
                          name="taxId"
                          value={taxIdInput}
                          onChange={(e) => setTaxIdInput(e.target.value)}
                          className="pl-10"
                          placeholder="Ingresa el ID de tu empresa"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray_b">
                        Nueva Contraseña *
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4 text-gray_m" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray_m" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray_b">
                        Confirmar Nueva Contraseña *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Repite tu nueva contraseña"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray_m" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray_m" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-green_m hover:bg-green_b"
                      >
                        {loading ? (
                          "Actualizando..."
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Actualizar Contraseña
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
