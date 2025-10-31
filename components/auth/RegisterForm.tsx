// components/auth/RegisterForm.tsx
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
import useRegister from "@/hooks/auth/useRegister";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  Key,
  Calendar,
} from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  contact_email: z
    .string()
    .email("Por favor ingresa un email corporativo válido"),
  main_phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos")
    .regex(/^[0-9+]+$/, "El teléfono solo puede contener números y el signo +"),
  fiscal_address: z
    .string()
    .min(5, "La dirección fiscal debe tener al menos 5 caracteres"),
  legal_tax_id: z
    .string()
    .min(5, "El ID de la empresa  debe tener al menos 5 caracteres")
    .max(20, "El ID de la empresa  no puede exceder 20 caracteres"),
  code: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(10, "El código no puede exceder 10 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "El código solo puede contener letras y números"),
  api_key_duration_days: z
    .number()
    .min(1, "La duración mínima es 1 día")
    .max(365, "La duración máxima es 365 días"),

  admin_first_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  admin_last_name: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  admin_email: z.string().email("Por favor ingresa un email personal válido"),
  admin_phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos")
    .regex(/^[0-9+]+$/, "El teléfono solo puede contener números y el signo +"),
  admin_password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  admin_username: z
    .string()
    .min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  is_active: z.boolean().optional(),
});

export function RegisterForm() {
  const router = useRouter();
  const { onRegister, loading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact_email: "",
      main_phone: "",
      fiscal_address: "",
      legal_tax_id: "",
      code: "",
      api_key_duration_days: 180,
      admin_first_name: "",
      admin_last_name: "",
      admin_email: "",
      admin_phone: "",
      admin_password: "",
      admin_username: "",
      is_active: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await onRegister(values);

    if (result?.success) {
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <Form {...form}>
      <Toaster richColors position="top-right" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray_xxl p-4 border-b lg:border-b-0 lg:border-r border-green_b">
            <h3 className="text-lg font-semibold mb-3 text-green_b border-b border-green_l pb-2">
              <Building className="w-5 h-5 inline mr-2" />
              Datos de la Empresa
            </h3>

            <div className="grid lg:grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Nombre legal de la empresa *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                        <Input
                          placeholder="Mi Empresa S.A."
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Email corporativo *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                        <Input
                          placeholder="empresa@email.com"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="main_phone"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Teléfono principal *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                        <Input
                          placeholder="+1234567890"
                          {...field}
                          type="tel"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_key_duration_days"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Duración de API Key (días) *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                        <Input
                          placeholder="30"
                          type="number"
                          min="1"
                          max="365"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name="legal_tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      ID de la empresa *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ID de empresa" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Código interno
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Código único" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fiscal_address"
              render={({ field }) => (
                <FormItem className="mb-4 mt-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Dirección fiscal *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                      <Input
                        placeholder="Dirección completa"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-[var(--color-gray_xxl)] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green_b border-b border-green_l pb-2">
              <User className="w-5 h-5 inline mr-2" />
              Datos del Administrador
            </h3>

            <div className="grid lg:grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name="admin_first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Nombres *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                        <Input
                          placeholder="Juan"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admin_last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Apellidos *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="admin_email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Email personal *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                      <Input
                        placeholder="tu@email.com"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_phone"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Teléfono *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                      <Input
                        placeholder="+1234567890"
                        {...field}
                        type="tel"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />

            <div className="grid lg:grid-cols-2 gap-2">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="admin_username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--color-gray_b)]">
                        Username *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="juan.perez" {...field} />
                      </FormControl>
                      <FormMessage className="text-[var(--color-red_l)]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="admin_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--color-gray_b)]">
                        Contraseña *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                          <Input
                            placeholder="••••••"
                            {...field}
                            type={showPassword ? "text" : "password"}
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
                      <FormMessage className="text-[var(--color-red_l)] text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-1/2 bg-[var(--color-green_b)] hover:bg-[var(--color-green_m)] transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registrando...
              </>
            ) : (
              "Crear cuenta empresarial"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
