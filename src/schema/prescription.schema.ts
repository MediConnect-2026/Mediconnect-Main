import z from "zod";

export function prescriptionSchema(t: (key: string) => string) {
  return z.object({
    patientId: z.string().min(1, t("prescription.patientIdRequired")),
    doctorId: z.string().min(1, t("prescription.doctorIdRequired")),
    diagnosisTittle: z
      .string()
      .min(5, t("prescription.diagnosisTittleMin"))
      .max(100, t("prescription.diagnosisTittleMax")),
    diagnosisDescription: z
      .string()
      .min(10, t("prescription.diagnosisDescriptionMin"))
      .max(1000, t("prescription.diagnosisDescriptionMax")),
    documents: z
      .array(
        z.object({
          url: z.string().url(t("prescription.documentUrlInvalid")),
          name: z
            .string()
            .min(1, t("prescription.documentNameRequired"))
            .max(255, t("prescription.documentNameMax")),
        }),
      )
      .optional(),
  });
}
