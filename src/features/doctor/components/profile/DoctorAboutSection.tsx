import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";

interface Education {
  degree: string;
  institution: string;
  location: string;
  year: string;
}

interface Experience {
  position: string;
  institution: string;
  period: string;
  description: string;
}

interface Props {
  doctor: {
    about: string;
    education: Education[];
    experience: Experience[];
    insurances: string[];
  };
}

function DoctorAboutSection({ doctor }: Props) {
  const { t } = useTranslation("doctor");

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {t("profile.about.title", "Acerca del doctor")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed px-6">
          {doctor.about}
        </p>
      </CardContent>
    </Card>
  );
}

export default DoctorAboutSection;
