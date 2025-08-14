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

const formSchema = z
  .object({
    company_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    company_email: z.string().email("Email inválido"),
    company_phone: z
      .string()
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos")
      .regex(
        /^[0-9+]+$/,
        "El teléfono solo puede contener números y el signo +"
      ),
    company_address: z
      .string()
      .min(5, "La dirección debe tener al menos 5 caracteres"),
    company_tax_id: z
      .string()
      .min(5, "El Tax ID debe tener al menos 5 caracteres")
      .max(20, "El Tax ID no puede exceder 20 caracteres"),
    company_code: z
      .string()
      .min(3, "El código debe tener al menos 3 caracteres")
      .max(10, "El código no puede exceder 10 caracteres")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "El código solo puede contener letras y números"
      ),

    user_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    user_lastname: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    user_email: z.string().email("Email inválido"),
    user_phone: z
      .string()
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos")
      .regex(
        /^[0-9+]+$/,
        "El teléfono solo puede contener números y el signo +"
      ),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      company_email: "",
      company_phone: "",
      company_address: "",
      company_tax_id: "",
      company_code: "",
      user_name: "",
      user_lastname: "",
      user_email: "",
      user_phone: "",
      password: "",
      confirm_password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray_xxl p-4 border-b lg:border-b-0 lg:border-r border-green_b">
            <h3 className="text-lg font-semibold mb-3 text-green_b border-b border-green_l">
              Datos de la Empresa
            </h3>

            {/* Nombre y Email en una fila */}
            <div className="grid lg:grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Nombre de la empresa
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Email corporativo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="empresa@email.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Teléfono en una fila independiente */}
            <FormField
              control={form.control}
              name="company_phone"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} type="tel" />
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />

            {/* Dirección en una fila independiente */}
            <FormField
              control={form.control}
              name="company_address"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Dirección fiscal
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />

            {/* Tax ID y Code en una fila */}
            <div className="grid lg:grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name="company_tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Legal Tax ID
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Identificación fiscal" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Código de identificación
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Código único" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sección de Datos del Usuario (sin cambios) */}
          <div className="bg-[var(--color-gray_xxl)] p-4 rounded-lg -ml-4">
            <h3 className="text-lg font-semibold mb-3 text-green_b border-b border-green_l">
              Datos del Usuario
            </h3>

            <div className="grid lg:grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Nombre
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-gray_b)]">
                      Apellido
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage className="text-[var(--color-red_l)]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_phone"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-[var(--color-gray_b)]">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} type="tel" />
                  </FormControl>
                  <FormMessage className="text-[var(--color-red_l)]" />
                </FormItem>
              )}
            />

            <div className="grid lg:grid-cols-2 gap-2">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--color-gray_b)]">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage className="text-[var(--color-red_l)] text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--color-gray_b)]">
                        Repetir contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage className="text-[var(--color-red_l)] text-xs" />
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
            className="w-full md:w-1/2 bg-[var(--color-green_b)] hover:bg-[var(--color-green_m)]"
          >
            Registrarse
          </Button>
        </div>
      </form>
    </Form>
  );
}
