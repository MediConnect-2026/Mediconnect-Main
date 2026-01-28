import { z } from "zod";

export const verifyAccountSchema = z.object({
  password: z.string().min(8, { message: "La contraseña es obligatoria." }),
});
