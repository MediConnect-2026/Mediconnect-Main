// AppointmentTypes.ts
import z from "zod";
import { appointmentSchemaBase } from "../schema/appointment.schema";

export type scheduleAppointment = z.infer<typeof appointmentSchemaBase>;
