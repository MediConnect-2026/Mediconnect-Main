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

interface IdentificationCardProps {
  isDoctor: boolean;
  isEditing: boolean;
  currentStatus: VerificationStatus;
  currentInfo: DoctorPersonalInfo | CenterPersonalInfo;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (data: DoctorPersonalInfo | CenterPersonalInfo) => void;
}

function IdentificationCard({
  isDoctor,
  isEditing,
  currentStatus,
  currentInfo,
  onStartEdit,
  onCancelEdit,
  onSubmit,
}: IdentificationCardProps) {
  const { t } = useTranslation("common");
  const isRejected = currentStatus === "REJECTED";

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
          className={`p-3 w-full rounded-lg mt-2 flex items-center gap-2 ${STATUS_DETAILS[currentStatus].bg}`}
        >
          <span className="flex-shrink-0">{STATUS[currentStatus].icon}</span>
          <h3
            className={`text-sm sm:text-base font-normal ${STATUS_DETAILS[currentStatus].text}`}
          >
            {t(`verification.messages.${currentStatus.toLowerCase()}`)}
          </h3>
        </div>

        <Separator className="my-4" />

        {isEditing ? (
          <MCFormWrapper
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
              >
                {t("verification.identification.cancel")}
              </MCButton>
              <MCButton type="submit" size="sm" className="w-full sm:w-auto">
                {t("verification.identification.submit")}
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
