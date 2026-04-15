import { Heart, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useTranslation } from "react-i18next";

interface MedicalInfoCardProps {
  isMobile: boolean;
  age: number | string;
  bmi: number | string;
  height: number | string;
  weight: number | string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  isLoadingAllergies?: boolean;
  isLoadingConditions?: boolean;
}

const MedicalInfoCard = ({
  isMobile,
  age,
  bmi,
  height,
  weight,
  bloodType,
  allergies,
  conditions,
  isLoadingAllergies = false,
  isLoadingConditions = false,
}: MedicalInfoCardProps) => {
  const { t } = useTranslation("patient");

  return (
    <motion.div {...fadeInUp}>
      <Card className="rounded-4xl border-0 h-full shadow-md bg-background p-2 lg:p-6">
        <CardContent className={isMobile ? "p-4" : "p-2"}>
          <h2
            className={`mb-6 ${isMobile ? "text-lg" : "text-3xl"} font-semibold text-foreground`}
          >
            {t("profileForm.clinicalHistory")}
          </h2>
          <div
            className={`mb-6 grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}
          >
            <div>
              <p className="text-xs text-muted-foreground">
                {t("profileForm.age")}
              </p>
              <p
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
              >
                {age}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">IMC</p>
              <p
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
              >
                {bmi}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("profileForm.height")}
              </p>
              <p
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
              >
                {height}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("profileForm.weight")}
              </p>
              <p
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
              >
                {weight}
              </p>
            </div>
          </div>
          <div className="border-t border-primary/15 my-4"></div>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">
              {t("profileForm.bloodType")}
            </p>
            <p
              className={`${isMobile ? "text-base" : "text-lg"} font-bold text-foreground`}
            >
              {bloodType}
            </p>
          </div>
          <div className="border-t border-primary/15 my-4"></div>
          <div
            className={`${isMobile ? "max-h-64" : "max-h-48"} overflow-y-auto pr-2`}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <Heart className="h-4 w-4" />
                <span className="font-medium">
                  {t("clinicalHistory.allergies")}
                </span>
              </div>
              {isLoadingAllergies ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : allergies.length > 0 ? (
                allergies.map((allergy, idx) => (
                  <p key={idx} className="mt-1 text-sm text-muted-foreground">
                    {allergy}
                  </p>
                ))
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("clinicalHistory.addAllergy")}
                </p>
              )}
            </div>
            <div className="border-t border-primary/15 my-4"></div>
            <div>
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  {t("clinicalHistory.conditions")}
                </span>
              </div>
              {isLoadingConditions ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : conditions.length > 0 ? (
                conditions.map((condition, idx) => (
                  <p key={idx} className="mt-1 text-sm text-muted-foreground">
                    {condition.startsWith("Condición Personal") ||
                    condition.startsWith("Personal status") ? (
                      <span className="text-red-600">
                        {t("clinicalHistory.personalConditionTitle")}
                      </span>
                    ) : (
                      condition
                    )}
                  </p>
                ))
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("clinicalHistory.addCondition")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MedicalInfoCard;
