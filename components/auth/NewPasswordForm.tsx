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

// Esquema de validación con Zod
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

export function NewPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Nueva contraseña establecida:", values.password);
    // Aquí iría la lógica para guardar la nueva contraseña
  };

  // Función para verificar la fortaleza de la contraseña
  const checkPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, feedback: [] };

    const feedback = [];
    let score = 0;

    // Longitud mínima
    if (password.length >= 6) score += 1;
    else feedback.push("Mínimo 6 caracteres");

    // Contiene letra minúscula
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Una letra minúscula");

    // Contiene letra mayúscula
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Una letra mayúscula");

    // Contiene número
    if (/\d/.test(password)) score += 1;
    else feedback.push("Un número");

    // Contiene carácter especial
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push("Un carácter especial");

    return { score, feedback };
  };

  const passwordValue = form.watch("password");
  const passwordStrength = checkPasswordStrength(passwordValue);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Nueva Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Nueva Contraseña
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    {...field}
                    value={field.value ?? ""}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[var(--color-gray_b)]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </FormControl>

              {/* Indicador de fortaleza de contraseña */}
              {passwordValue && (
                <div className="mt-2">
                  <div className="flex h-2 overflow-hidden rounded bg-gray_xxl">
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
                  <p className="text-xs mt-1 text-[var(--color-gray_b)]">
                    {passwordStrength.score < 5
                      ? `Requisitos faltantes: ${passwordStrength.feedback.join(
                          ", "
                        )}`
                      : "Contraseña segura"}
                  </p>
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
                Confirmar Contraseña
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    {...field}
                    value={field.value ?? ""}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[var(--color-gray_b)]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Ocultar" : "Mostrar"}
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
            className="w-full bg-[var(--color-green_b)] hover:bg-[var(--color-green_m)]"
            disabled={passwordStrength.score < 5}
          >
            Establecer Nueva Contraseña
          </Button>
        </div>
      </form>
    </Form>
  );
}
