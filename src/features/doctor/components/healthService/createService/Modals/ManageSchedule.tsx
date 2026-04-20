import React, { useRef, useEffect, useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MCModalBase } from "@/shared/components/MCModalBase";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { comercialScheduleSchema } from "@/schema/createService.schema";
import { scheduleService } from "@/shared/navigation/userMenu/editProfile/doctor/services/schedule.services";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { TimePickerInput } from "@/shared/components/forms/TimePickerInput";
import { Clock, AlertCircle } from "lucide-react";
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface ManageLocationProps {
  locationSelected?: number | undefined;
  children: React.ReactNode;
  scheduleData?: any;
  scheduleId?: number; // ID del horario para edición
  onScheduleCreated?: () => void;
  readonly?: boolean;
}

interface DaysSelectorProps {
  name: string;
  onChange?: (value: number[]) => void;
  readonly?: boolean;
}

function timeToMinutes(time: string): number {
  if (!time) return 0;

  let [hour, minute] = [0, 0];
  
  // Detectar si tiene AM/PM
  const ampmMatch = time.match(/(am|pm)$/i);
  
  if (ampmMatch) {
    // Formato 12 horas (con AM/PM)
    const isPM = ampmMatch[1].toLowerCase() === "pm";
    time = time.replace(/(am|pm)$/i, "").trim();
    
    const parts = time.split(":");
    hour = parseInt(parts[0], 10);
    minute = parseInt(parts[1], 10);
    
    // Conversión 12h → 24h
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
  } else {
    // Formato 24 horas (sin AM/PM) - NO hacer conversión
    const parts = time.split(":");
    hour = parseInt(parts[0], 10);
    minute = parseInt(parts[1], 10);
  }

  return hour * 60 + minute;
}

function DaysSelector({ name, onChange, readonly }: DaysSelectorProps) {
  const { t } = useTranslation("doctor");
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const DAY_LABELS: Record<number, string> = {
    0: t("days.sunday"),
    1: t("days.monday"),
    2: t("days.tuesday"),
    3: t("days.wednesday"),
    4: t("days.thursday"),
    5: t("days.friday"),
    6: t("days.saturday"),
  };

  return (
    <div className="flex flex-col my-2">
      <div className="flex flex-row justify-between items-center mb-2 gap-2">
        <label
          htmlFor={name}
          className="text-left text-base sm:text-lg text-primary"
        >
          {t("createService.schedule.days")}
        </label>
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="rounded-xl border border-primary/50 dark:bg-input/30 p-4">
            <div className="flex flex-wrap gap-2 mt-2">
              {DAY_ORDER.map((dayNum) => {
                const selected = field.value?.includes(dayNum) ?? false;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      if (readonly) return;
                      const current = field.value ?? [];
                      const next = selected
                        ? current.filter((d: number) => d !== dayNum)
                        : [...current, dayNum];
                      field.onChange(next);
                      if (onChange) onChange(next);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selected
                        ? "bg-primary text-background border border-transparent hover:bg-primary/90 hover:shadow-md active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                        : "bg-transparent border border-primary/30 text-primary hover:border-primary hover:bg-primary/5 active:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {DAY_LABELS[dayNum]}
                  </button>
                );
              })}
            </div>
            {errors[name] && (
              <p className="text-xs text-destructive mt-1">
                {String(errors[name]?.message)}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
}

function ManageSchedule({ locationSelected, scheduleData, scheduleId, children, onScheduleCreated, readonly }: ManageLocationProps) {
  const { t } = useTranslation("doctor");
  const submitRef = useRef<(() => void) | null>(null);
  const formRef = useRef<any>(null);
  const setToast = useGlobalUIStore((state) => state.setToast);
  const closeModalRef = useRef<{ close: () => void }>(null);

  const [shouldLoadData, setShouldLoadData] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const serviceDuration = useCreateServicesStore(
    (s) => s.createServiceData.duration,
  );

  const setComercialScheduleField = useCreateServicesStore(
    (s) => s.setComercialScheduleField,
  );

  const setComercialScheduleData = useCreateServicesStore(
    (s) => s.setComercialScheduleData,
  );

  const comercialScheduleData = useCreateServicesStore(
    (s) => s.comercialScheduleData,
  );

  const clearComercialScheduleData = useCreateServicesStore(
    (s) => s.clearComercialScheduleData,
  );

  const comercialScheduleFormSchema = comercialScheduleSchema(t);

  const minDurationMinutes =
    (serviceDuration?.hours || 0) * 60 + (serviceDuration?.minutes || 0);


  const handleTriggerClick = useCallback(() => {

    if (scheduleData) {
      setComercialScheduleField("name", scheduleData.nombre);
      setComercialScheduleField("day", scheduleData.dias);
      setComercialScheduleField("startTime", scheduleData.horaInicio);
      setComercialScheduleField("endTime", scheduleData.horaFin);
    } else {
      // ✅ Si no hay datos, limpiar el formulario
      setComercialScheduleField("name", "");
      setComercialScheduleField("day", []);
      setComercialScheduleField("startTime", "");
      setComercialScheduleField("endTime", "");
    }
    
    setShouldLoadData(true);
    setModalKey((prev) => prev + 1);

  }, [setComercialScheduleField, scheduleData]);

  const handleSubmit = async (data: any) => {
    
    // Normalizar el formato de tiempo agregando :00 si no tiene segundos
    const normalizeTime = (time: string) => {
      if (!time) return time;
      const parts = time.split(':');
      return parts.length === 2 ? `${time}:00` : time;
    };

    const normalizedData = {
      ...data,
      startTime: normalizeTime(data.startTime),
      endTime: normalizeTime(data.endTime),
    };

    setIsLoading(true);

    try {
      const isEditMode = !!scheduleId;
      const requestPayload = {
        nombre: normalizedData.name,
        diasSemana: normalizedData.day,
        horaInicio: normalizedData.startTime,
        horaFin: normalizedData.endTime,
        ...(isEditMode && { estado: "Activo" }) // Agregar estado solo en modo edición
      };

      if (isEditMode) {
        // Modo edición
        await scheduleService.updateScheduleService(scheduleId, requestPayload);
      } else {
        // Modo creación
        await scheduleService.createScheduleService({
          nombre: normalizedData.name,
          diasSemana: normalizedData.day,
          horaInicio: normalizedData.startTime,
          horaFin: normalizedData.endTime
        });
      }
           
      setComercialScheduleData(normalizedData);

      setToast({
        type: "success",
        message: isEditMode 
          ? t("createService.schedule.successUpdating") 
          : t("createService.schedule.successCreating"),
        open: true,
      });
      
      // ✅ Llamar al callback para recargar los horarios
      onScheduleCreated?.();

      // ✅ Cerrar el modal solo si fue exitoso
      closeModalRef.current?.close();

    } catch (error: any) {
      console.error("Error al procesar el horario:", error);
      
      setToast({
        type: "error",
        message: error.message || t("createService.schedule.errorCreating"),
        open: true,
      });

    } finally {
      setIsLoading(false);
    }
  };

  
  const handleConfirm = async () => {
    submitRef.current?.();
  };

  const handleClose = () => {
    clearComercialScheduleData();
  };

  useEffect(() => {
    if (!shouldLoadData) return;

    if (locationSelected === undefined) {
      clearComercialScheduleData();
    }

    setShouldLoadData(false);
  }, [shouldLoadData, locationSelected, clearComercialScheduleData]);

  useEffect(() => {
    if (formRef.current && formRef.current.reset) {
      formRef.current.reset({
        name: comercialScheduleData.name || "",
        day: comercialScheduleData.day || [],
        startTime: comercialScheduleData.startTime || "",
        endTime: comercialScheduleData.endTime || ""
      });
    }
  }, [comercialScheduleData]);

  const hasTimeConflict =
    comercialScheduleData.startTime &&
    comercialScheduleData.endTime &&
    timeToMinutes(comercialScheduleData.startTime) >=
    timeToMinutes(comercialScheduleData.endTime);

  const durationMinutes =
    comercialScheduleData.startTime && comercialScheduleData.endTime
      ? timeToMinutes(comercialScheduleData.endTime) -
        timeToMinutes(comercialScheduleData.startTime)
      : 0;

  const hasInsufficientDuration =
    comercialScheduleData.startTime &&
    comercialScheduleData.endTime &&
    !hasTimeConflict &&
    minDurationMinutes > 0 &&
    durationMinutes < minDurationMinutes;

  const triggerWithHandler = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleTriggerClick,
      })
    : children;

  return (
    <MCModalBase
      id="manage-location-modal"
      title={scheduleId 
        ? t("createService.schedule.manageSchedule")
        : t("createService.schedule.createSchedule")}
      size="mdAuto"
      variant="decide"
      trigger={triggerWithHandler}
      triggerClassName="w-full"
      onConfirm={handleConfirm}
      onClose={handleClose}
      closeRef={closeModalRef}
      autoCloseOnConfirm={false}
      showConfirm={!readonly}
      disabledConfirm={
        isLoading ||
        !comercialScheduleData.name ||
        !comercialScheduleData.startTime ||
        !comercialScheduleData.endTime ||
        comercialScheduleData.day.length === 0 ||
        !!hasTimeConflict ||
        !!hasInsufficientDuration
      }
      confirmText={isLoading 
        ? (scheduleId ? t("createService.schedule.updating") : t("createService.schedule.creating"))
        : undefined}
    >
      <MCFormWrapper
        schema={comercialScheduleFormSchema}
        defaultValues={{
          name: comercialScheduleData.name || "",
          day: comercialScheduleData.day || [],
          startTime: comercialScheduleData.startTime || "",
          endTime: comercialScheduleData.endTime || ""
        }}
        onSubmit={handleSubmit}
        className="flex flex-col"
        submitRef={submitRef}
        formRef={formRef}
      >
        <MCInput
          label={t("createService.schedule.scheduleName")}
          name="name"
          maxLength={30}
          placeholder={t("createService.schedule.scheduleNamePlaceholder")}
          value={comercialScheduleData.name || ""}
          onChange={(e) => setComercialScheduleField("name", e.target.value)}
          disabled={isLoading || readonly}
        />

        <DaysSelector
          name="day"
          onChange={(value) => setComercialScheduleField("day", value)}
          readonly={readonly}
        />

        {/* Start Time */}
        <div className="mb-4">
          <Controller
            key={`startTime-${modalKey}`}
            name="startTime"
            render={({ field }) => (
              <TimePickerInput
                label={t("createService.schedule.startTime")}
                value={field.value || comercialScheduleData.startTime || ""}
                onChange={(val) => {
                  field.onChange(val);
                  setComercialScheduleField("startTime", val);
                }}
                disabled={isLoading || readonly}
              />
            )}
          />
        </div>

        {/* End Time */}
        <div className="mb-4">
          <Controller
            key={`endTime-${modalKey}`}
            name="endTime"
            render={({ field }) => (
              <TimePickerInput
                label={t("createService.schedule.endTime")}
                value={field.value || comercialScheduleData.endTime || ""}
                onChange={(val) => {
                  field.onChange(val);
                  setComercialScheduleField("endTime", val);
                }}
                disabled={isLoading || readonly}
              />
            )}
          />
        </div>

        {/* Validation messages */}
        {hasTimeConflict && (
          <div className="flex items-start gap-2 text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 mb-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{t("createService.schedule.errorEndTime")}</span>
          </div>
        )}

        {hasInsufficientDuration && (
          <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 text-sm p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 mb-2">
            <Clock size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              {t("createService.schedule.errorMinDuration")}{" "}
              <strong>{minDurationMinutes} min</strong>
              {" "}(seleccionado:{" "}
              <strong>{Math.max(0, durationMinutes)} min</strong>).
            </span>
          </div>
        )}
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default ManageSchedule;
