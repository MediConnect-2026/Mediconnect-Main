import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect, useCallback } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import { educationService } from "@/shared/navigation/userMenu/editProfile/doctor/services/education.service";
import type { FormacionAcademicaBackend } from "../../../../shared/navigation/userMenu/editProfile/doctor/services/education.types";
import { onAcademicChanged } from "@/lib/events/academicFormation";

interface Props {
  isMyProfile?: boolean;
  onOpenSheet?: () => void;
  doctorId?: number;
}

// ✅ Subcomponente separado para que los hooks se llamen siempre en el nivel superior
interface EducationItemProps {
  formacion: FormacionAcademicaBackend;
  formatPeriod: (fechaInicio: string, fechaFin: string | null, enCurso: boolean) => string;
}

const EducationItem = ({ formacion, formatPeriod }: EducationItemProps) => {
  const institutionRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    const el = institutionRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  };

  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <li key={formacion.id} className="space-y-1">
      <div className="flex gap-2 items-center">
        <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
        <TooltipProvider>
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <div
                ref={institutionRef}
                className="font-semibold max-w-full truncate cursor-pointer"
                style={{ maxWidth: "100%" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {formacion.universidad.nombre}
              </div>
            </TooltipTrigger>
            <TooltipContent>{formacion.universidad.nombre}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-sm">{formacion.nombre}</div>
      <div className="text-xs text-muted-foreground">
        {formatPeriod(formacion.fechaInicio, formacion.fechaFinalizacion, formacion.enCurso)}
      </div>
    </li>
  );
};

const DoctorEducationSection = ({ isMyProfile = false, onOpenSheet, doctorId }: Props) => {
  const { t, i18n } = useTranslation("doctor");
  const [formaciones, setFormaciones] = useState<FormacionAcademicaBackend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileDoctorId =  !isMyProfile && doctorId ? doctorId : 0; // Aseguramos que sea un número

  const fetchFormaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      if (profileDoctorId) {
        const response = await educationService.getFormacionesAcademicasByDoctorId(profileDoctorId, {
          target: i18n.language,
          translate_fields: "nombre",
        });
        setFormaciones(response.data?.formaciones || []);
      } else {
        const response = await educationService.getFormacionesAcademicas({
          target: i18n.language,
          translate_fields: "nombre",
        });
        setFormaciones(response.data?.formaciones || []);
      }
    } catch (err) {
      console.error("Error al obtener formaciones académicas:", err);
      setError(
        t(
          "profile.education.errorLoadingData",
          "Error al cargar las formaciones académicas",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    fetchFormaciones();
  }, [i18n.language, fetchFormaciones]);

  useEffect(() => {
    const unsubscribe = onAcademicChanged(() => {
      fetchFormaciones();
    });

    return unsubscribe;
  }, [fetchFormaciones]);

  const formatPeriod = (
    fechaInicio: string,
    fechaFin: string | null,
    enCurso: boolean,
  ) => {
    const startYear = new Date(fechaInicio).getFullYear();
    if (enCurso) {
      return `${startYear} - Presente`;
    }
    const endYear = fechaFin ? new Date(fechaFin).getFullYear() : "";
    return `${startYear}${endYear ? ` - ${endYear}` : ""}`;
  };

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          <span className="inline-flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-secondary" />
            {t("profile.education.title", "Formación Académica")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              {t("profile.education.loading", "Cargando formación académica...")}
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : formaciones.length > 0 ? (
          <ul className="space-y-3">
            {/* ✅ Usando el subcomponente en lugar de hooks dentro del map */}
            {formaciones.map((formacion) => (
              <EducationItem
                key={formacion.id}
                formacion={formacion}
                formatPeriod={formatPeriod}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-6">
            <p className="text-muted-foreground mb-4 text-sm">
              {isMyProfile
                ? t(
                    "profile.education.addEducation",
                    "Agrega tu formación académica para completar tu perfil profesional",
                  )
                : t(
                    "profile.education.noEducation",
                    "Este doctor no ha registrado su formación académica.",
                  )}
            </p>
            {isMyProfile && onOpenSheet && (
              <MCButton variant="outline" onClick={onOpenSheet} size="sm">
                {t("profile.education.addButton", "Agregar formación académica")}
              </MCButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorEducationSection;