import { RecoveryForm } from "@/components/auth/RecoveryForm";
import Link from "next/link";

export default function RecoveryPage() {
  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
      <div className=" w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
          <p className="text-gray_b text-sm">
            Te enviaremos un enlace a tu correo para restablecer tu contraseña
          </p>
        </div>
        <RecoveryForm />
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
