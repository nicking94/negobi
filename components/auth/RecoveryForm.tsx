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

// Validaciones con Zod
const formSchema = z.object({
  email: z.string().email("Email inválido"),
  taxId: z.string().min(6, "RIF inválido").max(13, "RIF inválido"),
});

export function RecoveryForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      taxId: "",
    },
  });

  const { onRecoveryPassword } = useRecoveryPassword();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email, taxId } = values;
    await onRecoveryPassword({ email, legal_tax_id: taxId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="tu@email.com"
                  {...field}
                  value={field.value ?? ""} // <-- evita undefined
                />
              </FormControl>
              <FormMessage className="text-xs text-[var(--color-red_l)]" />
            </FormItem>
          )}
        />

        {/* Campo RIF */}
        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                RIF
              </FormLabel>
              <FormControl>
                <Input placeholder="RIF" {...field} value={field.value ?? ""} />
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
          >
            Enviar
          </Button>
        </div>
      </form>
    </Form>
  );
}
