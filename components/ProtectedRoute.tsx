// components/ProtectedRoute.tsx (actualizado)
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Usar replace para evitar que el usuario vuelva atrás
      router.replace("/login");
    } else if (
      !isLoading &&
      isAuthenticated &&
      user &&
      requiredRole &&
      user.role !== requiredRole
    ) {
      // Redirigir si no tiene el rol requerido
      router.replace("/unauthorized");
    }
  }, [user, isAuthenticated, isLoading, router, pathname, requiredRole]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green_b mx-auto"></div>
          <p className="mt-3 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // No renderizar nada si no está autenticado (será redirigido)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar rol si es requerido
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-green_b text-white rounded-md hover:bg-green-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
