import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schemas
const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  legal_tax_id: z.string().min(1, "El RIF es requerido"),
  contact_email: z.string().email("Correo inválido"),
  main_phone: z.string().min(1, "El teléfono es requerido"),
  fiscal_address: z.string().min(1, "La dirección es requerida"),
  api_key_duration_days: z.number().min(1, "La duración es requerida"),
});

const adminSchema = z.object({
  admin_first_name: z.string().min(1, "El nombre es requerido"),
  admin_last_name: z.string().min(1, "El apellido es requerido"),
  admin_username: z.string().min(1, "El usuario es requerido"),
  admin_email: z.string().email("Correo inválido"),
  admin_phone: z.string().min(1, "El teléfono es requerido"),
  admin_password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const createCompanySchema = companySchema.merge(adminSchema);
export const editCompanySchema = companySchema;

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
export type EditCompanyFormValues = z.infer<typeof editCompanySchema>;

// Tipo para los errores del formulario
type FormErrors = Record<string, { message?: string }>;

export const useCompanyForm = (isEdit: boolean) => {
  const schema = isEdit ? editCompanySchema : createCompanySchema;

  const form = useForm<CreateCompanyFormValues | EditCompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: "",
          code: "",
          legal_tax_id: "",
          contact_email: "",
          main_phone: "",
          fiscal_address: "",
          api_key_duration_days: 180,
        }
      : {
          name: "",
          code: "",
          legal_tax_id: "",
          contact_email: "",
          main_phone: "",
          fiscal_address: "",
          admin_first_name: "",
          admin_last_name: "",
          admin_username: "",
          admin_email: "",
          admin_phone: "",
          admin_password: "",
          api_key_duration_days: 180,
        },
  });

  // Función auxiliar para verificar si hay errores en campos de admin
  const hasAdminError = (field: keyof CreateCompanyFormValues): boolean => {
    if (isEdit) return false;

    const errors = form.formState.errors as FormErrors;
    return !!errors[field];
  };

  // Función auxiliar para obtener errores de admin
  const getAdminError = (field: keyof CreateCompanyFormValues) => {
    if (isEdit) return undefined;

    const errors = form.formState.errors as FormErrors;
    return errors[field];
  };

  return {
    form,
    hasAdminError,
    getAdminError,
    isEditMode: isEdit,
  };
};
