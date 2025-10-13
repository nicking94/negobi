// utils/formatDate.ts
import { format } from "date-fns";

export const formatDate = (
  dateString: string | Date,
  includeTime: boolean = true
) => {
  if (!dateString) return "No especificada";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  const formatString = includeTime ? "dd/MM/yyyy hh:mm a" : "dd/MM/yyyy";
  return format(date, formatString);
};
