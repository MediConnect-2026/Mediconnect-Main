import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import StatusBadge from "./Statusbadge";
import {
  type VerificationStatus,
  STATUS,
  STATUS_DETAILS,
} from "./Verificationconstants";

interface DocumentsSectionProps {
  isDoctor: boolean;
  currentStatus: VerificationStatus;
  children: React.ReactNode;
}

function DocumentsSection({
  isDoctor,
  currentStatus,
  children,
}: DocumentsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl md:rounded-4xl h-fit">
      <CardContent className="p-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-xl font-semibold">
              {isDoctor ? "Documentos del Doctor" : "Documentos del Centro"}
            </h2>
          </div>
          <p>Documentos enviados para verificación</p>
        </div>

        <Separator className="my-4" />

        {children}
      </CardContent>
    </Card>
  );
}

export default DocumentsSection;
