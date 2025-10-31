//app/new-password/page.tsx
"use client";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NewPasswordPageContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const taxId = params.get("taxId");

  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
      <div className=" w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Nueva contraseña</h1>
          <p className="text-gray_b text-sm">
            ¡Último paso! Define tu nueva contraseña para que puedas volver a
            acceder a tu cuenta.
          </p>
        </div>
        {email && taxId && (
          <NewPasswordForm email={email} legal_tax_id={taxId} />
        )}

        <div className="text-center text-md">
          <Link
            href="/login"
            className="text-green_b hover:underline font-medium"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center">Cargando...</p>}>
      <NewPasswordPageContent />
    </Suspense>
  );
}
