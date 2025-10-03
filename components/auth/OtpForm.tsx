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
import { useRef, useEffect } from "react";
import useValidateOtp from "@/hooks/auth/useValidateOtp";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

// Validaciones con Zod
const formSchema = z.object({
  otp: z.string().length(6, "El código OTP debe tener 6 dígitos"),
});

type otpParams = {
  email: string;
  legal_tax_id: string;
};

export function OTPValidationForm({ email, legal_tax_id }: otpParams) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Referencias para los inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Inicializar el array de referencias
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const { onValidateOtp } = useValidateOtp();
  const route = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await onValidateOtp({
      email,
      legal_tax_id,
      otp: values.otp,
    });
    if (result?.status === 201) {
      toast.success("Código OTP validado con éxito.");
      setTimeout(() => {
        route.push(`/new-password?email=${email}&taxId=${legal_tax_id}`);
      }, 3000); // 3 segundos
    } else {
      console.error("Error al validar OTP:", result?.data);
    }
  };

  // Manejar el cambio en los inputs individuales
  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      // Actualizar el valor en el form
      const currentOtp = form.getValues("otp") || "";
      const newOtpArray = currentOtp.split("");
      newOtpArray[index] = value;
      const newOtp = newOtpArray.join("");

      form.setValue("otp", newOtp, { shouldValidate: true });

      // Avanzar al siguiente input si se ingresó un valor
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Manejar la tecla retroceso
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      // Retroceder al input anterior si está vacío y se presiona backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Manejar el pegado de contenido
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      // Actualizar el valor del formulario
      form.setValue("otp", pastedData, { shouldValidate: true });

      // Llenar los inputs individuales
      const digits = pastedData.split("");
      digits.forEach((digit, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = digit;
        }
      });

      // Enfocar el siguiente input disponible
      if (pastedData.length < 6) {
        inputRefs.current[pastedData.length]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  return (
    <Form {...form}>
      <Toaster richColors position="top-right" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo OTP */}
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[var(--color-gray_b)]">
                Código OTP de 6 dígitos
              </FormLabel>
              <FormControl>
                <div className="flex space-x-2 justify-center">
                  {[...Array(6)].map((_, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl"
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      value={field.value?.[index] || ""}
                    />
                  ))}
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
          >
            Validar Código
          </Button>
        </div>
      </form>
    </Form>
  );
}
