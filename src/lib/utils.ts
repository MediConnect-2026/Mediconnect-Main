import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// FILE UTILITIES
// ============================================

/**
 * Formatea el tamaño de un archivo en bytes a una representación legible
 * @param bytes - Tamaño del archivo en bytes
 * @returns String formateado (ej: "1.5 MB", "234 KB", "45 B")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Obtiene el icono emoji según el tipo de archivo
 * @param fileType - MIME type del archivo
 * @returns Emoji representativo del tipo de archivo
 */
export function getFileIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("doc")) return "📝";
  if (fileType.includes("xls") || fileType.includes("sheet")) return "📊";
  if (fileType.includes("txt")) return "📃";
  if (fileType.includes("zip") || fileType.includes("rar")) return "📦";
  if (fileType.includes("video")) return "🎬";
  if (fileType.includes("audio")) return "🎵";
  if (fileType.includes("image")) return "🖼️";
  return "📁";
}

/**
 * Genera un ID único para identificar items temporales
 * @returns String UUID v4
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

