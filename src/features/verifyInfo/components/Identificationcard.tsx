import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCButton from "@/shared/components/forms/MCButton";
import {
  doctorPersonalInfoSchema,
  centerPersonalInfoSchema,
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
} from "@/schema/verifyInfo.schema";
import {
  type VerificationStatus,
  STATUS,
  STATUS_DETAILS,
} from "./Verificationconstants";
import StatusBadge from "./Statusbadge";
import DoctorForm from "./Doctorform";
import CenterForm from "./Centerform";
import DoctorReadOnlyView from "./Doctorreadonlyview";
import CenterReadOnlyView from "./Centerreadonlyview";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface IdentificationCardProps {
  isDoctor: boolean;
  isEditing: boolean;
  currentStatus: VerificationStatus;
  currentInfo: DoctorPersonalInfo | CenterPersonalInfo;
  isSubmitting?: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (data: DoctorPersonalInfo | CenterPersonalInfo) => Promise<void> | void;
}

function IdentificationCard({
  isDoctor,
  isEditing,
  currentStatus,
  currentInfo,
  isSubmitting = false,
  onStartEdit,
  onCancelEdit,
  onSubmit,
}: IdentificationCardProps) {
  const { t } = useTranslation("common");
  const isRejected = currentStatus === "REJECTED";

  const formInstanceKey = useMemo(() => {
    if (isDoctor) {
      const info = currentInfo as DoctorPersonalInfo;
      return `doctor-${info.identificationNumber || ""}-${info.email || ""}-${isEditing ? "edit" : "view"}`;
    }

    const info = currentInfo as CenterPersonalInfo;
    const lat = info.coordinates?.latitude ?? "";
    const lng = info.coordinates?.longitude ?? "";
    return `center-${info.barrioId || ""}-${info.address || ""}-${lat}-${lng}-${isEditing ? "edit" : "view"}`;
  }, [currentInfo, isDoctor, isEditing]);

  return (
    <Card className="rounded-4xl h-fit">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isDoctor
                ? t("verification.identification.title")
                : t("verification.identification.centerTitle")}
            </h2>
            <StatusBadge
              label={t(`verification.status.${currentStatus.toLowerCase()}`)}
              color={STATUS[currentStatus].color}
            />
          </div>
          <p className="text-sm sm:text-base">
            {t("verification.identification.description")}
          </p>
        </div>

        <div
          className={`p-3 w-full rounded-lg mt-2 flex items-start gap-4 ${STATUS_DETAILS[currentStatus].bg}`}
        >
          <span className="flex-shrink-0">{STATUS[currentStatus].icon}</span>
          <div className="flex-1">
            <h3
              className={`text-sm sm:text-base font-normal ${STATUS_DETAILS[currentStatus].text}`}
            >
              {t(`verification.messages.${currentStatus.toLowerCase()}`)}
            </h3>
            {currentInfo.comentarioVerificacion && (
              <p className={`text-sm mt-2 ${STATUS_DETAILS[currentStatus].text}`}>
                {currentInfo.comentarioVerificacion}
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {isEditing ? (
          <MCFormWrapper
            key={formInstanceKey}
            schema={
              isDoctor
                ? doctorPersonalInfoSchema(t)
                : centerPersonalInfoSchema(t)
            }
            onSubmit={onSubmit}
            defaultValues={currentInfo}
          >
            {isDoctor ? <DoctorForm /> : <CenterForm />}

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
              <MCButton
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {t("verification.identification.cancel")}
              </MCButton>
              <MCButton
                type="submit"
                size="sm"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isSubmitting
                  ? t("verification.identification.submitting")
                  : t("verification.identification.submit")}
              </MCButton>
            </div>
          </MCFormWrapper>
        ) : (
          <div>
            {isDoctor ? (
              <DoctorReadOnlyView data={currentInfo as DoctorPersonalInfo} />
            ) : (
              <CenterReadOnlyView data={currentInfo as CenterPersonalInfo} />
            )}

            {isRejected && (
              <div className="flex justify-end mt-6 sm:mt-8">
                <MCButton
                  variant="outline"
                  size="sm"
                  onClick={onStartEdit}
                  className="w-full sm:w-auto"
                >
                  {isDoctor
                    ? t("verification.identification.resubmitPersonal")
                    : t("verification.identification.resubmitCenter")}
                </MCButton>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IdentificationCard;
