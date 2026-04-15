import { contactSchema, newsletterSchema } from "@/schema/landingSchema";
import { z } from "zod";
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
