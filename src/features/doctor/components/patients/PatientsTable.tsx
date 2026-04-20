import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Ellipsis, ShieldAlert, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import {
} from "@/shared/ui/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import PatientActions from "@/features/doctor/components/patients/PatientActions";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { PacienteDelDoctor } from "@/types/DoctorStatsTypes";

/**
 * Tipo Patient para el componente de tabla
 * Es compatible con la respuesta de la API y con datos mock
 */
export type Patient = PacienteDelDoctor | {
  pacienteId?: string | number;
  id?: string;
  nombre?: string;
  patientName?: string;
  apellido?: string;
  fotoPerfil?: string;
  patientImage?: string;
  edad?: number;
  age?: number;
  genero?: string;
  gender?: string;
  telefono?: string;
  phone?: string;
  email?: string;
  condiciones?: { total: number; lista: any[] };
  conditionsCount?: number;
  ultimaCita?: { servicio?: { especialidad?: { nombre: string } } } | { specialty?: string };
  specialty?: string;
  ubicacionUltimaCita?: { nombre: string };
  location?: string;
  totalCitas?: number;
  lastVisit?: string;
  serviceReceived?: string;
  conversationId?: string;
  allergiesCount?: number;
};

interface MyPatientsTableProps {
  patients: Patient[];
}

const truncate = (text: string, max = 28) =>
  text.length > max ? `${text.substring(0, max)}...` : text;

export default function MyPatientsTable({ patients }: MyPatientsTableProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const patientsList = patients as any[];

  const genderLabel = (gender: string | undefined) => {
    const labels: Record<string, string> = {
      male: t("patients.table.male"),
      female: t("patients.table.female"),
      other: t("patients.table.other"),
    };
    return labels[gender || "other"] ?? gender;
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.patient")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.ageGender")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.contact")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.medicalInfo")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.lastVisit")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.serviceSpecialty")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.location")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("patients.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patientsList.length > 0 ? (
            patientsList.map((row: any) => (
              <TableRow key={row.id || row.pacienteId}>
                {/* Paciente */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`${isMobile ? "h-12 w-12" : "h-16 w-16"
                        } shrink-0 overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center`}
                    >
                      {row.patientImage ? (
                        <Avatar
                          className={`${isMobile ? "h-12 w-12" : "h-16 w-16"
                            } rounded-full overflow-hidden`}
                        >
                          <AvatarImage
                            src={row.patientImage}
                            alt={row.patientName}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {row.patientName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <MCUserAvatar
                          name={row.patientName}
                          square
                          size={isMobile ? 48 : 64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span
                      className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {row.patientName}
                    </span>
                  </div>
                </TableCell>

                {/* Edad / Género */}
                <TableCell>
                  <div
                    className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {row.age}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {genderLabel(row.gender)}
                  </div>
                </TableCell>

                {/* Contacto */}
                <TableCell>
                  <div
                    className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {row.phone}
                  </div>
                  {row.email && row.email.length > 28 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-muted-foreground cursor-help">
                            {truncate(row.email)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{row.email}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      {row.email}
                    </div>
                  )}
                </TableCell>

                {/* Info Médica */}
                <TableCell className="text-left align-middle">
                  {row.conditionsCount === 0 && row.allergiesCount === 0 ? (
                    <span
                      className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {t("patients.table.none")}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-0.5 items-start justify-start">
                      {row.conditionsCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                          <ShieldAlert className="w-3 h-3 shrink-0" />
                          {t("patients.table.conditions")}:{" "}
                          {row.conditionsCount}
                        </span>
                      )}
                      {row.allergiesCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-700 font-medium">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {t("patients.table.allergies")}: {row.allergiesCount}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Última Visita */}
                <TableCell
                  className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {row.lastVisit}
                </TableCell>

                {/* Servicio / Especialidad */}
                <TableCell>
                  <div
                    className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {row.serviceReceived}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.specialty}
                  </div>
                </TableCell>

                {/* Ubicación */}
                <TableCell className={isMobile ? "text-xs" : "text-sm"}>
                  {row.location}
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-bg-btn-secondary rounded-full transition-colors hover:bg-primary/10 active:bg-primary/20 group"
                      >
                        <Ellipsis className="h-4 w-4 text-primary group-hover:text-primary/80 group-active:text-primary/60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent isTablet placement="left">
                      <PatientActions
                        patient={{
                          id: row.id || row.pacienteId,
                          pacienteId: row.pacienteId || row.id,
                          conversationId: row.conversationId,
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className={`text-center ${isMobile ? "text-xs" : ""}`}
              >
                {t("patients.table.noPatients")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

    </div>
  );
}
