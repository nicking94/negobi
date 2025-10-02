// components/auth/RecoveryForm.tsx
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
import useRecoveryPassword from "@/hooks/auth/useRecoveryPassword";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Building2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
  taxId: z
    .string()
    .min(5, "El ID de la empresa debe tener al menos 5 caracteres")
    .max(20, "El ID de la empresa  no puede exceder 20 caracteres"),
});

export function RecoveryForm() {
  const route = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      taxId: "",
    },
  });

  const { onRecoveryPassword, loading } = useRecoveryPassword();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email, taxId } = values;
    const result = await onRecoveryPassword({ email, legal_tax_id: taxId });

    if (result?.status === 200 || result?.status === 201) {
      toast.success(
        "📧 Código de recuperación enviado. Revisa tu bandeja de entrada."
      );
      setTimeout(() => {
        route.push(`/validateOTP?email=${email}&taxId=${taxId}`);
      }, 2000);
    }
  };

  return (
    <Form {...form}>
      <Toaster richColors position="top-right" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Correo electrónico registrado
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    placeholder="tu@email.com"
                    {...field}
                    className="pl-10"
                    value={field.value ?? ""}
                  />
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
                ID de la empresa
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray_m" />
                  <Input
                    placeholder="ID de empresa"
                    {...field}
                    className="pl-10"
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-[var(--color-red_l)]" />
            </FormItem>
          )}
        />

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-green_b)] hover:bg-[var(--color-green_m)] transition-colors"
          >
            {loading ? "Enviando código..." : "Enviar código de recuperación"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
