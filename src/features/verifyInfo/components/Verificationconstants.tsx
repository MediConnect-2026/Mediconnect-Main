import { CircleSlash, CircleCheck, Loader } from "lucide-react";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export const STATUS = {
  REJECTED: {
    icon: <CircleSlash className="text-[#C62828]" />,
    label: "Rechazado", // This will be overridden by translations
    color: "bg-[#C62828]/15 text-[#C62828]",
    textColor: "text-[#C62828]",
  },
  PENDING: {
    icon: <Loader className="text-[#C77A1F] animate-spin" />,
    label: "En revisión",
    color: "bg-[#C77A1F]/15 text-[#C77A1F]",
    textColor: "text-[#C77A1F]",
  },
  APPROVED: {
    icon: <CircleCheck className="text-[#2E7D32]" />,
    label: "Aceptado",
    color: "bg-[#2E7D32]/15 text-[#2E7D32]",
    textColor: "text-[#2E7D32]",
  },
} as const;

export const STATUS_DETAILS = {
  REJECTED: {
    message: "Tu información fue rechazada. Por favor revisa los detalles.",
    bg: "bg-[#C62828]/15",
    text: "text-[#C62828]",
  },
  PENDING: {
    message:
      "Tu documento está en revisión. Te avisaremos cuando haya una respuesta.",
    bg: "bg-[#C77A1F]/15",
    text: "text-[#C77A1F]",
  },
  APPROVED: {
    message: "¡Tu información fue aceptada!",
    bg: "bg-[#2E7D32]/15",
    text: "text-[#2E7D32]",
  },
} as const;
