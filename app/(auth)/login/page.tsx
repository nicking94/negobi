// app/login/page.tsx (actualizado)
"use client";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard/settings/profile"); // Usar replace en lugar de push
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
        <div className="w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Cargando...</h1>
            <p className="text-gray_b">Verificando autenticación</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green_b"></div>
          </div>
        </div>
      </div>
    );
  }

  // No mostrar el formulario si ya está autenticado (será redirigido)
  if (isAuthenticated) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
        <div className="w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Redirigiendo...</h1>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green_b"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
      <div className="w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="text-gray_b">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-md">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="text-green_b hover:underline font-medium"
          >
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
