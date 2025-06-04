
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return "-";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount);
}

export function formatDateForInput(date: string | Date): string {
  if (!date) return new Date().toISOString().split("T")[0];
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Agregar la zona horaria local para evitar el desfase
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function formatDateForDatabase(dateString: string): string {
  if (!dateString) return new Date().toISOString().split("T")[0];
  
  // Crear la fecha en la zona horaria local
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toISOString().split("T")[0];
}
