import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-radial from-green_xl via-green_m to-green_b">
      <div className=" w-full max-w-lg p-8 space-y-6 bg-gray_xxl rounded-lg shadow-lg shadow-green_b border border-green_b">
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
