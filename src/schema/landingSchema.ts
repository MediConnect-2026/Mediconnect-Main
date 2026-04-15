import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  subject: z.string().min(3, "El asunto es obligatorio"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export const newsletterSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});
