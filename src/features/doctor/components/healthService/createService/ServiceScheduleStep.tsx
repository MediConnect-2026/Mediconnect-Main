import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { ChevronRight, Loader, AlertCircle } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { Button } from "@/shared/ui/button";
import ManageSchedule from "./Modals/ManageSchedule";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { scheduleService } from "@/shared/navigation/userMenu/editProfile/doctor/services/schedule.services";
import { useAppStore } from "@/stores/useAppStore";
import type { ValidateScheduleResponse } from "@/shared/navigation/userMenu/editProfile/doctor/services/schedule.types";
import { formatTimeTo12h } from "@/utils/appointmentMapper";

function ServiceScheduleStep({ isEditMode = false }: { isEditMode?: boolean }) {
  const isMobile = useIsMobile();
  const { t } = useTranslation("doctor");

  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [conflictData, setConflictData] = useState<ValidateScheduleResponse["data"] | null>(null);

  const user = useAppStore((state) => state.user);

  const comercialScheduleSelected = useCreateServicesStore(
    (s) => s.createServiceData.comercial_schedule,
  );

  const setComercialScheduleData = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );

  const goToNextStep = useCreateServicesStore((s) => s.goToNextStep);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);

  const getDaysAndHours = (schedule: any) => {
    const dayMap: { [key: number]: string } = {
      0: t("days.sunday"),
      1: t("days.monday"),
      2: t("days.tuesday"),
      3: t("days.wednesday"),
      4: t("days.thursday"),
      5: t("days.friday"),
      6: t("days.saturday"),
    };

    const firstDay = dayMap[schedule.dias[0]] || "";
    const lastDay = dayMap[schedule.dias[schedule.dias.length - 1]] || "";

    return `${firstDay} ${formatTimeTo12h(schedule.horaInicio)} - ${lastDay} ${formatTimeTo12h(schedule.horaFin)}`;
  };

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await scheduleService.getScheduleServices(user?.id.toString() || "");
      setSchedules(response.data);
    } catch (error) {
      console.error("Error al cargar los horarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Función para validar conflictos
  const validateSchedules = async () => {
    if (!comercialScheduleSelected || !Array.isArray(comercialScheduleSelected) || comercialScheduleSelected.length < 2) {
      setConflictData(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await scheduleService.validateSchedule({
        horarioIds: comercialScheduleSelected as number[],
      });

      if (response.success) {
        setConflictData(response.data);
      }
    } catch (error) {
      console.error("Error al validar horarios:", error);
      setConflictData(null);
    } finally {
      setIsValidating(false);
    }
  };

  // ✅ Validar cuando cambian los horarios seleccionados
  useEffect(() => {
    validateSchedules();
  }, [comercialScheduleSelected]);

  useEffect(() => {
    loadSchedules();
  }, []);

  // ✅ Obtener nombres de días en conflicto
  const getConflictDayNames = (days: number[]) => {
    const dayMap: { [key: number]: string } = {
      0: t("days.sunday"),
      1: t("days.monday"),
      2: t("days.tuesday"),
      3: t("days.wednesday"),
      4: t("days.thursday"),
      5: t("days.friday"),
      6: t("days.saturday"),
    };

    return days.map(day => dayMap[day]).join(", ");
  };

  // ✅ Obtener nombre del horario por ID
  const getScheduleName = (id: number) => {
    const schedule = schedules.find(s => s.id === id);
    return schedule?.nombre || `Horario ${id}`;
  };

  // ✅ Determinar si hay conflictos
  const hasConflicts = conflictData?.conflicto === true;

  return (
    <ServicesLayoutsSteps
      title={t("createService.schedule.title")}
      description={t("createService.schedule.description")}
    >
      <div
        className={`w-full ${schedules.length > 6 ? "max-h-80 overflow-y-auto" : ""}`}
      >
        {schedules.length === 0 && !isLoading && (
          <div className={'grid grid-cols-1 gap-4'}>
            <p className="text-center text-sm text-gray-500">
              {t("createService.schedule.noSchedules")}
            </p>
          </div>
        )}
        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
        >
          {isLoading && (
            <p className="text-center text-sm text-gray-500">
              <Loader className="animate-spin h-5 w-5 mx-auto mb-2 text-primary" />
            </p>
          )}
          {schedules.map((item) => (
            <div
              key={item.id}
              className={`border w-full border-primary/15 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition
                ${Array.isArray(comercialScheduleSelected) && comercialScheduleSelected.includes(item.id) ? "bg-accent/50 border-none" : ""}
              `}
              onClick={() =>
                setComercialScheduleData(
                  "comercial_schedule",
                  Array.isArray(comercialScheduleSelected)
                    ? comercialScheduleSelected.includes(item.id)
                      ? comercialScheduleSelected.filter((id) => id !== item.id)
                      : [...comercialScheduleSelected, item.id]
                    : [item.id],
                )
              }
            >
              <div
                className={`flex flex-col gap-1 ${isMobile ? "max-w-[200px]" : "max-w-[220px]"}`}
              >
                <p
                  className={`${isMobile ? "text-sm" : "text-base"} font-medium truncate`}
                >
                  {item.nombre}
                </p>
                <p
                  className={`${isMobile ? "text-xs" : "text-sm"} font-normal truncate`}
                >
                  {getDaysAndHours(item)}
                </p>
              </div>
              <ManageSchedule
                locationSelected={item.id}
                scheduleData={item}
                scheduleId={item.id}
                onScheduleCreated={loadSchedules}
                readonly={!isEditMode}
              >
                <Button
                  variant="outline"
                  className="rounded-4xl p-2 border-none bg-transparent shadow-none text-primary/75 hover:bg-primary/10 hover:text-primary focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <ChevronRight className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                </Button>
              </ManageSchedule>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Mensaje de validación de conflictos */}
      {isValidating && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-2">
          <Loader className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t("createService.schedule.validatingSchedules")}
          </p>
        </div>
      )}

      {/* ✅ Mensaje de conflictos detectados */}
      {!isValidating && hasConflicts && conflictData && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                {t("createService.schedule.conflictDetected")}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                {conflictData.mensaje}
              </p>

              {/* ✅ Detalles de conflictos */}
              {conflictData.detalles && conflictData.detalles.length > 0 && (
                <div className="space-y-2">
                  {conflictData.detalles.map((detalle, index) => (
                    <div key={index} className="pl-3 border-l-2 border-red-300 dark:border-red-700">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {getScheduleName(detalle.horario1Id)} ↔ {getScheduleName(detalle.horario2Id)}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {t("createService.schedule.conflictDays")}: {getConflictDayNames(detalle.diasConflicto)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Mensaje de éxito (sin conflictos) */}
      {!isValidating && !hasConflicts && comercialScheduleSelected && Array.isArray(comercialScheduleSelected) && comercialScheduleSelected.length >= 2 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 flex items-start gap-2">
          <div className="h-4 w-4 rounded-full bg-green-600 dark:bg-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs">✓</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            {t("createService.schedule.noConflicts")}
          </p>
        </div>
      )}

      <ManageSchedule onScheduleCreated={loadSchedules}>
        <MCButton className="w-full rounded-xl mt-6" variant="tercero">
          {t("createService.schedule.addSchedule")}
        </MCButton>
      </ManageSchedule>

      <AuthFooterContainer
        continueButtonProps={{
          disabled: !comercialScheduleSelected || hasConflicts || isValidating, // ✅ Deshabilitar si hay conflictos
          onClick: () => goToNextStep(),
        }}
        backButtonProps={{
          onClick: () => goToPreviousStep(),
        }}
      />
    </ServicesLayoutsSteps>
  );
}

export default ServiceScheduleStep;