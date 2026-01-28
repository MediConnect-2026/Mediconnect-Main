import z from "zod";
import { verifyAccountSchema } from "@/schema/account.schema";
export type VerifyAccount = z.infer<typeof verifyAccountSchema>;
