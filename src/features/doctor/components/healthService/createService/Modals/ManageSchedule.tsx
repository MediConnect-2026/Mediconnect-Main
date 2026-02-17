import React, { useRef, useEffect, useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MCModalBase } from "@/shared/components/MCModalBase";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { comercialScheduleSchema } from "@/schema/createService.schema";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const LOCATIONS_DATA = [
  {
    id: 1,
    name: "Clínica Abreu",
    address: "Av. Independencia 105, Santo Domingo",
    latitude: 18.4636,
    longitude: -69.9271,
  },
  {
    id: 2,
    name: "Centro Médico UCE",
    address: "Av. Máximo Gómez 46, Santo Domingo",
    latitude: 18.4762,
    longitude: -69.9117,
  },
];

interface ManageLocationProps {
  locationSelected?: number | undefined;
  children: React.ReactNode;
}

interface DaysSelectorProps {
  name: string;
  onChange?: (value: number[]) => void;
}

function timeToMinutes(time: string): number {
  if (!time) return 0;

  let [hour, minute] = [0, 0];
  let isPM = false;

  const ampmMatch = time.match(/(am|pm)$/i);
  if (ampmMatch) {
    isPM = ampmMatch[1].toLowerCase() === "pm";
    time = time.replace(/(am|pm)$/i, "").trim();
  }

  const parts = time.split(":");
  hour = parseInt(parts[0], 10);
  minute = parseInt(parts[1], 10);

  if (isPM && hour < 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function DaysSelector({ name, onChange }: DaysSelectorProps) {
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

function ManageSchedule({ locationSelected, children }: ManageLocationProps) {
  const { t } = useTranslation("doctor");
  const submitRef = useRef<(() => void) | null>(null);
  const formRef = useRef<any>(null);

  const [startTimeTouched, setStartTimeTouched] = useState(false);
  const [endTimeTouched, setEndTimeTouched] = useState(false);
  const [shouldLoadData, setShouldLoadData] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const serviceDuration = useCreateServicesStore(
    (s) => s.createServiceData.duration,
  );

  const isPresentialOrMixed = useCreateServicesStore(
    (s) =>
      s.createServiceData.selectedModality === "presencial" ||
      s.createServiceData.selectedModality === "Mixta",
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

  const locationOptions = LOCATIONS_DATA.map((location) => ({
    value: location.id.toString(),
    label: location.name,
  }));

  const minDurationMinutes =
    (serviceDuration?.hours || 0) * 60 + (serviceDuration?.minutes || 0);

  const handleTriggerClick = useCallback(() => {
    setComercialScheduleField("startTime", "");
    setComercialScheduleField("endTime", "");
    setStartTimeTouched(false);
    setEndTimeTouched(false);
    setShouldLoadData(true);
    setModalKey((prev) => prev + 1);
  }, [setComercialScheduleField]);

  const handleSubmit = (data: any) => {
    console.log("Datos enviados desde modal:", data);
    setComercialScheduleData(data);
  };

  const handleConfirm = () => {
    submitRef.current?.();
    console.log("mi data:", comercialScheduleData);
  };

  const handleClose = () => {
    clearComercialScheduleData();
    setStartTimeTouched(false);
    setEndTimeTouched(false);
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
        endTime: comercialScheduleData.endTime || "",
        locationId: comercialScheduleData.locationId || undefined,
      });
    }
  }, [comercialScheduleData]);

  const hasTimeConflict =
    comercialScheduleData.startTime &&
    comercialScheduleData.endTime &&
    startTimeTouched &&
    endTimeTouched &&
    timeToMinutes(comercialScheduleData.startTime) >=
      timeToMinutes(comercialScheduleData.endTime);

  const hasInsufficientDuration =
    comercialScheduleData.startTime &&
    comercialScheduleData.endTime &&
    startTimeTouched &&
    endTimeTouched &&
    timeToMinutes(comercialScheduleData.endTime) -
      timeToMinutes(comercialScheduleData.startTime);
  minDurationMinutes;

  const triggerWithHandler = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleTriggerClick,
      })
    : children;

  return (
    <MCModalBase
      id="manage-location-modal"
      title={t("createService.schedule.manageSchedule")}
      size="mdAuto"
      variant="decide"
      trigger={triggerWithHandler}
      triggerClassName="w-full"
      onConfirm={handleConfirm}
      onClose={handleClose}
      disabledConfirm={
        !comercialScheduleData.startTime ||
        !comercialScheduleData.endTime ||
        !startTimeTouched ||
        !endTimeTouched ||
        (isPresentialOrMixed && !comercialScheduleData.locationId) ||
        comercialScheduleData.day.length === 0 ||
        !!hasTimeConflict ||
        !!hasInsufficientDuration
      }
    >
      <MCFormWrapper
        schema={comercialScheduleFormSchema}
        defaultValues={{
          name: comercialScheduleData.name || "",
          day: comercialScheduleData.day || [],
          startTime: "",
          endTime: "",
          locationId: comercialScheduleData.locationId || undefined,
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
        />

        <DaysSelector
          name="day"
          onChange={(value) => setComercialScheduleField("day", value)}
        />

        <MCInput
          key={`startTime-${modalKey}`}
          name="startTime"
          label={t("createService.schedule.startTime")}
          placeholder={t("createService.schedule.startTimePlaceholder")}
          variant="decideHour"
          value={comercialScheduleData.startTime || ""}
          onChange={(e) => {
            setComercialScheduleField("startTime", e.target.value);
            setStartTimeTouched(true);
          }}
        />

        <MCInput
          key={`endTime-${modalKey}`}
          name="endTime"
          label={t("createService.schedule.endTime")}
          placeholder={t("createService.schedule.endTimePlaceholder")}
          variant="decideHour"
          value={comercialScheduleData.endTime || ""}
          onChange={(e) => {
            setComercialScheduleField("endTime", e.target.value);
            setEndTimeTouched(true);
          }}
        />

        {isPresentialOrMixed && (
          <MCSelect
            name="locationId"
            label={t("createService.schedule.location")}
            placeholder={t("createService.schedule.selectLocation")}
            options={locationOptions}
            searchable
            onChange={(value) => setComercialScheduleField("locationId", value)}
          />
        )}

        {hasTimeConflict && (
          <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-4xl border border-red-200">
            {t("createService.schedule.errorEndTime")}
          </div>
        )}

        {hasInsufficientDuration && (
          <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-4xl border border-red-200">
            {t("createService.schedule.errorMinDuration")} {minDurationMinutes}{" "}
            minutos.
          </div>
        )}
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default ManageSchedule;
