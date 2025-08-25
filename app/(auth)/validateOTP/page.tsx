"use client";

import { Suspense } from "react";
import { OTPValidationForm } from "@/components/auth/OtpForm";
import { useRouter, useSearchParams } from "next/navigation";

function RecoveryPageContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const taxId = params.get("taxId");
  const route = useRouter();

  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
      <div className=" w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Validación de código</h1>
          <p className="text-gray_b text-sm">
            Por favor ingresa el código que te enviamos a tu correo para
            verificar tu identidad.
          </p>
        </div>
        {email && taxId ? (
          <OTPValidationForm email={email} legal_tax_id={taxId} />
        ) : (
          <p className="text-red-600 text-center">
            Parámetros faltantes. Por favor, vuelve a la página de recuperación.
          </p>
        )}

        <div className="text-center text-md">
          <p
            onClick={() => route.back()}
            className="text-green_b hover:underline font-medium cursor-pointer"
          >
            Atrás
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense fallback={<p className="text-center">Cargando...</p>}>
      <RecoveryPageContent />
    </Suspense>
  );
}
