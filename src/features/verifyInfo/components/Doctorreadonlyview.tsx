import { useTranslation } from "react-i18next";
import type { DoctorPersonalInfo } from "@/schema/verifyInfo.schema";

interface DoctorReadOnlyViewProps {
  data: DoctorPersonalInfo;
}

function DoctorReadOnlyView({ data }: DoctorReadOnlyViewProps) {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.firstName")}
        </p>
        <p className="font-medium text-foreground break-words">
          {data.firstName}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.lastName")}
        </p>
        <p className="font-medium text-foreground break-words">
          {data.lastName}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.gender")}
        </p>
        <p className="font-medium text-foreground">{data.gender}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.email")}
        </p>
        <p className="font-medium text-foreground break-words">{data.email}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.nationality")}
        </p>
        <p className="font-medium text-foreground">{data.nationality}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.identificationNumber")}
        </p>
        <p className="font-medium text-foreground">
          {data.identificationNumber}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.phone")}
        </p>
        <p className="font-medium text-foreground">{data.phone}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.physicalAddress")}
        </p>
        <p className="font-medium text-foreground break-words">
          {data.address}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.primarySpecialty")}
        </p>
        <p className="font-medium text-foreground">{data.primarySpecialty}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.secondarySpecialty")}
        </p>
        <p className="font-medium text-foreground">
          {data.secondarySpecialty || "-"}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("verification.identification.medicalLicense")}
        </p>
        <p className="font-medium text-foreground">{data.medicalLicense}</p>
      </div>
    </div>
  );
}

export default DoctorReadOnlyView;
