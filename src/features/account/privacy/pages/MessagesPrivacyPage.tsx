import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAppStore } from "@/stores/useAppStore";
import {
  doctorMessageConfigSchema,
  centerMessageConfigSchema,
  patientMessageConfigSchema,
} from "@/schema/account.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

function MessagesPrivacyPage() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const userRole = useAppStore((state) => state.user?.rol);

  const doctorConfig = useProfileStore(
    (state) => state.doctorMessageConfigData,
  );
  const setDoctorConfig = useProfileStore(
    (state) => state.setDoctorMessageConfigData,
  );
  const centerConfig = useProfileStore(
    (state) => state.centerMessageConfigData,
  );
  const setCenterConfig = useProfileStore(
    (state) => state.setCenterMessageConfigData,
  );
  const patientConfig = useProfileStore(
    (state) => state.patientMessageConfigData,
  );
  const setPatientConfig = useProfileStore(
    (state) => state.setPatientMessageConfigData,
  );

  // Handlers for each config
  const handleDoctorConfigSubmit = (data: any) => setDoctorConfig(data);
  const handleCenterConfigSubmit = (data: any) => setCenterConfig(data);
  const handlePatientConfigSubmit = (data: any) => setPatientConfig(data);

  let configForm = null;
  if (userRole === "DOCTOR") {
    configForm = (
      <MCFormWrapper
        schema={doctorMessageConfigSchema(t)}
        onSubmit={handleDoctorConfigSubmit}
        defaultValues={
          doctorConfig || { patientMessage: "NONE", centerMessage: "NONE" }
        }
        className={`${isMobile ? "w-full" : "w-md"} mt-4 flex flex-col items-center gap-4 h-full`}
      >
        <MCSelect
          name="patientMessage"
          label={t("messagesPrivacy.patientMessagesLabel")}
          options={[
            {
              label: t("messagesPrivacy.withAppointment"),
              value: "WITH_APPOINTMENT",
            },
            {
              label: t("messagesPrivacy.previous"),
              value: "PREVIOUS",
            },
            { label: t("messagesPrivacy.none"), value: "NONE" },
          ]}
          className="w-full"
        />
        <MCSelect
          name="centerMessage"
          label={t("messagesPrivacy.centerMessagesLabel")}
          options={[
            {
              label: t("messagesPrivacy.connectionEstablished"),
              value: "CONNECTION_ESTABLISHED",
            },
            {
              label: t("messagesPrivacy.anyCenter"),
              value: "ANY_CENTER",
            },
            { label: t("messagesPrivacy.none"), value: "NONE" },
          ]}
          className="w-full"
        />
      </MCFormWrapper>
    );
  } else if (userRole === "CENTER") {
    configForm = (
      <MCFormWrapper
        schema={centerMessageConfigSchema(t)}
        onSubmit={handleCenterConfigSubmit}
        defaultValues={
          centerConfig || { patientMessage: "NONE", doctorMessage: "NONE" }
        }
        className={`${isMobile ? "w-full" : "w-md"} mt-4 flex flex-col items-center gap-4 h-full`}
      >
        <MCSelect
          name="patientMessage"
          label={t("messagesPrivacy.patientMessagesLabel")}
          options={[
            { label: t("messagesPrivacy.any"), value: "ANY" },
            {
              label: t("messagesPrivacy.withAppointment"),
              value: "WITH_APPOINTMENT",
            },
            { label: t("messagesPrivacy.none"), value: "NONE" },
          ]}
          className="w-full"
        />
        <MCSelect
          name="doctorMessage"
          label={t("messagesPrivacy.doctorMessagesLabel")}
          options={[
            { label: t("messagesPrivacy.any"), value: "ANY" },
            {
              label: t("messagesPrivacy.affiliated"),
              value: "AFFILIATED",
            },
            { label: t("messagesPrivacy.none"), value: "NONE" },
          ]}
          className="w-full"
        />
      </MCFormWrapper>
    );
  } else if (userRole === "PATIENT") {
    configForm = (
      <MCFormWrapper
        schema={patientMessageConfigSchema(t)}
        onSubmit={handlePatientConfigSubmit}
        defaultValues={
          patientConfig || { doctorMessage: "NONE", centerMessage: "NONE" }
        }
        className={`${isMobile ? "w-full" : "w-md"} mt-4 flex flex-col items-center gap-4 h-full`}
      >
        <MCSelect
          name="doctorMessage"
          label={t("messagesPrivacy.doctorMessagesLabel")}
          options={[
            { label: t("messagesPrivacy.any"), value: "ANY" },
            {
              label: t("messagesPrivacy.myDoctors"),
              value: "MY_DOCTORS",
            },
            {
              label: t("messagesPrivacy.withAppointment"),
              value: "WITH_APPOINTMENT",
            },
            { label: t("messagesPrivacy.none"), value: "NONE" },
          ]}
          className="w-full"
        />
        <MCSelect
          name="centerMessage"
          label={t("messagesPrivacy.centerMessagesLabel")}
          options={[
            { label: t("messagesPrivacy.any"), value: "ANY" },
            {
              label: t("messagesPrivacy.withAppointment"),
              value: "WITH_APPOINTMENT",
            },
            { label: t("messagesPrivacy.none"), value: "NONE" },
          ]}
          className="w-full"
        />
      </MCFormWrapper>
    );
  }

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div className="flex flex-col gap-6 items-center justify-center w-full mb-8">
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`${isMobile ? "text-3xl" : "text-5xl"} font-medium text-center mb-2`}
          >
            {t("messagesPrivacy.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("messagesPrivacy.description")}
          </p>
          {configForm}
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default MessagesPrivacyPage;
