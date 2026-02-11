import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import type { VerificationStatus } from "./Verificationconstants";

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
  const { t } = useTranslation("common");

  return (
    <Card className="rounded-4xl h-fit">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isDoctor
                ? t("verification.documents.doctorTitle")
                : t("verification.documents.centerTitle")}
            </h2>
          </div>
          <p className="text-sm sm:text-base">
            {t("verification.documents.description")}
          </p>
        </div>

        <Separator className="my-4" />

        {children}
      </CardContent>
    </Card>
  );
}

export default DocumentsSection;
