import z from "zod";
import {
  defaultServiceSchema,
  defaultLocationSchema,
  defaultComercialScheduleSchema,
} from "../schema/createService.schema";

export type CreateServiceType = z.infer<typeof defaultServiceSchema>;
export type LocationType = z.infer<typeof defaultLocationSchema>;
export type ComercialScheduleType = z.infer<
  typeof defaultComercialScheduleSchema
>;
