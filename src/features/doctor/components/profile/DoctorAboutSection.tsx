import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";
import MCButton from "@/shared/components/forms/MCButton";

interface Props {
  doctor: any;
  isMyProfile?: boolean;
  onOpenSheet?: () => void;
}

function DoctorAboutSection({ doctor, isMyProfile = false, onOpenSheet }: Props) {
  const { t } = useTranslation("doctor");

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {t("profile.about.title", "Acerca del doctor")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {doctor.biografia || doctor?.doctor?.biografia ? (
          <p className="text-muted-foreground leading-relaxed px-6">
            {doctor.biografia || doctor?.doctor?.biografia}
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-6">
            <p className="text-muted-foreground mb-4">
              {isMyProfile 
                ? t("profile.about.addBio", "Agrega una biografía para que tus pacientes te conozcan mejor")
                : t("profile.about.noBio", "Este doctor no ha proporcionado una biografía.")}
            </p>
            {isMyProfile && onOpenSheet && (
              <MCButton
                variant="outline"
                onClick={onOpenSheet}
                size="sm"
              >
                {t("profile.about.addButton", "Agregar biografía")}
              </MCButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DoctorAboutSection;
