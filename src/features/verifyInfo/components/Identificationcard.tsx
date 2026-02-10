import React from "react";
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
import StatusBadge from "./Statusbadge";
import DoctorForm from "./Doctorform";
import CenterForm from "./Centerform";
import DoctorReadOnlyView from "./Doctorreadonlyview";
import CenterReadOnlyView from "./Centerreadonlyview";
import {
  type VerificationStatus,
  STATUS,
  STATUS_DETAILS,
} from "./Verificationconstants";

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
  const { t } = useTranslation();
  const isRejected = currentStatus === "REJECTED";

  return (
    <Card className="rounded-2xl md:rounded-4xl h-fit">
      <CardContent className="p-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-xl font-semibold">
              {isDoctor ? "Identificación Personal" : "Información del Centro"}
            </h2>
            <StatusBadge
              label={STATUS[currentStatus].label}
              color={STATUS[currentStatus].color}
            />
          </div>
          <p>Información enviada para verificación</p>
        </div>

        <div
          className={`p-3 w-full rounded-lg mt-2 flex items-center gap-2 ${STATUS_DETAILS[currentStatus].bg}`}
        >
          <span>{STATUS[currentStatus].icon}</span>
          <h3
            className={`text-base font-normal ${STATUS_DETAILS[currentStatus].text}`}
          >
            {STATUS_DETAILS[currentStatus].message}
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

            <div className="flex justify-end gap-3 mt-8">
              <MCButton
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
              >
                Cancelar
              </MCButton>
              <MCButton type="submit" size="sm">
                Enviar
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
              <div className="flex justify-end mt-8">
                <MCButton variant="outline" size="sm" onClick={onStartEdit}>
                  {isDoctor
                    ? "Reenviar Datos Personales"
                    : "Reenviar Información del Centro"}
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
