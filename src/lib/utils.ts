import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a formato legible dd/mm/yyyy HH:mm
 */
export function formatearFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return "-";
  
  try {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

/**
 * Formatea una fecha y hora a formato legible dd/mm/yyyy HH:mm
 */
export function formatearFechaHora(fecha: string | Date | null | undefined): string {
  if (!fecha) return "-";
  
  try {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}
