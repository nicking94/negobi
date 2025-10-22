// components/auth/NewPasswordForm.tsx - ACTUALIZADO
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
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react";
import useChangePassword from "@/hooks/auth/useChangePassword";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula"
      )
      .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
      )
      .regex(/\d/, "La contraseña debe contener al menos un número")
      .regex(
        /[^a-zA-Z0-9]/,
        "La contraseña debe contener al menos un carácter especial"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type NewPasswordType = {
  email: string;
  legal_tax_id: string;
};

export function NewPasswordForm({ legal_tax_id }: NewPasswordType) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { onChangePassword, loading } = useChangePassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const token = localStorage.getItem("tempToken");
    const result = await onChangePassword({
      new_password: values.password,
      legal_tax_id,
      token,
    });

    if (result?.success) {
      toast.success("🎉 ¡Contraseña actualizada! Redirigiendo al login...");
    }
  };

  // Función para verificar la fortaleza de la contraseña (mantener igual)
  const checkPasswordStrength = (password: string) => {
    const requirements = [
      { test: (p: string) => p.length >= 6, text: "Mínimo 6 caracteres" },
      { test: (p: string) => /[a-z]/.test(p), text: "Una letra minúscula" },
      { test: (p: string) => /[A-Z]/.test(p), text: "Una letra mayúscula" },
      { test: (p: string) => /\d/.test(p), text: "Un número" },
      {
        test: (p: string) => /[^a-zA-Z0-9]/.test(p),
        text: "Un carácter especial",
      },
    ];

    const results = requirements.map((req) => ({
      met: req.test(password),
      text: req.text,
    }));

    const score = results.filter((r) => r.met).length;
    const allMet = score === requirements.length;

    return { results, score, allMet };
  };

  const passwordValue = form.watch("password");
  const passwordStrength = checkPasswordStrength(passwordValue);

  return (
    <Form {...form}>
      <Toaster richColors position="top-right" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Nueva Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Nueva contraseña
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contraseña segura"
                    {...field}
                    value={field.value ?? ""}
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

              {/* Indicador de fortaleza de contraseña */}
              {passwordValue && (
                <div className="mt-3 p-3 bg-gray_xxl rounded-lg">
                  <div className="space-y-2">
                    {passwordStrength.results.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        {req.met ? (
                          <CheckCircle className="h-4 w-4 text-green_b" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red_l" />
                        )}
                        <span
                          className={req.met ? "text-green_b" : "text-gray_m"}
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex h-2 overflow-hidden rounded bg-gray_xxl">
                    <div
                      className="transition-all duration-300 ease-in-out"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor:
                          passwordStrength.score < 2
                            ? "var(--color-red_l)"
                            : passwordStrength.score < 4
                            ? "orange"
                            : "var(--color-green_b)",
                      }}
                    />
                  </div>
                </div>
              )}

              <FormMessage className="text-xs text-[var(--color-red_l)]" />
            </FormItem>
          )}
        />

        {/* Campo Confirmar Contraseña */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Confirmar contraseña
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu nueva contraseña"
                    {...field}
                    value={field.value ?? ""}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray_m hover:text-gray_b transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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

        {/* Botón */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={loading || !passwordStrength.allMet}
            className="w-full bg-[var(--color-green_b)] hover:bg-[var(--color-green_m)] transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Actualizando...
              </>
            ) : (
              "Establecer nueva contraseña"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
