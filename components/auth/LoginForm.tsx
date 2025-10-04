// components/auth/LoginForm.tsx (corregido)
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useLogin from "@/hooks/auth/useLogin";
import { Toaster, toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  taxId: z.string().min(1, "El ID de la empresa es requerido"),
  rememberMe: z.boolean().optional(),
});

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { onLogin, loading } = useLogin();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      taxId: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email, password, taxId, rememberMe } = values;

    // Enviar los datos al hook, el rememberMe se manejará en el frontend
    const result = await onLogin({
      email,
      password,
      legal_tax_id: taxId,
      rememberMe, // Esto se manejará solo en el frontend
    });

    if (result.success) {
      toast.success("Sesión iniciada correctamente");
      // La redirección ya se maneja en el hook useLogin
    } else {
      // El error ya se maneja en el hook useLogin
    }
  };

  return (
    <Form {...form}>
      <Toaster richColors position="top-right" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Correo electrónico
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    placeholder="tu@empresa.com"
                    {...field}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-[var(--color-red_l)]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Contraseña
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    {...field}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray_m hover:text-gray_b transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-[var(--color-red_l)]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                ID Empresa
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    placeholder="ID de tu empresa"
                    {...field}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-[var(--color-red_l)]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-2 border-[var(--color-green_l)] data-[state=checked]:bg-[var(--color-green_b)]"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-[var(--color-gray_b)] cursor-pointer">
                Mantener sesión iniciada
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="w-full flex justify-center pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-green_b)] hover:bg-[var(--color-green_m)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando sesión...
              </div>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          <a
            href="/recovery"
            className="text-[var(--color-green_b)] hover:underline font-medium transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </Form>
  );
}
