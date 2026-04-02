import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { doctorExperienceSchema } from "@/schema/profile.schema";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Plus, Trash2, GripVertical, Loader2, Save } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { doctorService } from "./services/doctor.service";
import type { ExperienciaLaboral } from "./services/doctor.types";
import { emitExperienceChanged } from "@/lib/events/experienceEvents";
import { toast } from "sonner";

interface ExperienceFormData {
  id?: number; // ID de la experiencia en el backend (para actualizar/eliminar)
  hospital: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrently?: boolean; // Campo para "Actualmente trabajo aquí"
}

interface ExperienceProps {
  onOpenChange: (open: boolean) => void;
}

interface DraggableExperienceCardProps {
  index: number;
  onDelete: (index: number) => void;
  onSave: (index: number) => Promise<void>;
  isMobile: boolean;
  months: Array<{ value: string; label: string }>;
  years: Array<{ value: string; label: string }>;
  t: any;
}

function DraggableExperienceCard({
  index,
  onDelete,
  onReorder,
  onSave,
  isMobile,
  months,
  years,
  t,
}: DraggableExperienceCardProps & {
  onReorder: (startIndex: number, finishIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { control, watch, setValue, trigger } = useFormContext();
  const isCurrently = watch(`experiences.${index}.isCurrently`);

  // Limpiar fechas de fin cuando se marca "Actualmente trabajo aquí"
  useEffect(() => {
    if (isCurrently) {
      setValue(`experiences.${index}.endMonth`, "");
      setValue(`experiences.${index}.endYear`, "");
    }
  }, [isCurrently, index, setValue]);

  useEffect(() => {
    const element = ref.current;
    const handle = handleRef.current;
    if (!element || !handle) return;

    return combine(
      draggable({
        element,
        dragHandle: handle,
        getInitialData: () => ({ index }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: () => ({ index }),
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: ({ source }) => {
          setIsOver(false);
          const startIndex = source.data.index as number;
          if (startIndex !== index) {
            onReorder(startIndex, index);
          }
        },
      }),
    );
  }, [index, onReorder]);

  const handleSaveExperience = async () => {
    // Validar solo los campos de esta experiencia
    const fieldsToValidate = [
      `experiences.${index}.hospital`,
      `experiences.${index}.position`,
      `experiences.${index}.startMonth`,
      `experiences.${index}.startYear`,
    ];

    // Si no está trabajando actualmente, validar también las fechas de fin
    if (!isCurrently) {
      fieldsToValidate.push(`experiences.${index}.endMonth`);
      fieldsToValidate.push(`experiences.${index}.endYear`);
    }

    const isValid = await trigger(fieldsToValidate as any);

    if (isValid) {
      setIsSaving(true);
      try {
        await onSave(index);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div
      ref={ref}
      className={`relative rounded-3xl border p-4 bg-bg-secondary transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${isOver ? "border-primary border-2 shadow-lg" : "border-primary/10"}`}
    >
      {/* Header Row: Drag, Title, Delete */}
      <div className="flex items-center justify-between pb-4">
        {/* Drag Handle */}
        <button
          ref={handleRef}
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors mr-2"
          aria-label={t("experienceForm.dragHandle")}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Experience Title */}
        <h3 className="text-lg font-semibold text-primary flex-1 text-center">
          {t("experienceForm.experienceTitle")} {index + 1}
        </h3>

        {/* Delete Button */}
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors ml-2"
          onClick={() => onDelete(index)}
          aria-label={t("experienceForm.deleteExperience")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 pl-2">
        <MCInput
          name={`experiences.${index}.position`}
          label={t("experienceForm.position")}
          type="text"
          size="small"
          placeholder={t("experienceForm.positionPlaceholder")}
        />

        <MCInput
          name={`experiences.${index}.hospital`}
          label={t("experienceForm.organization")}
          type="text"
          size="small"
          placeholder={t("experienceForm.organizationPlaceholder")}
        />

        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("experienceForm.startDate")}
          </label>
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"
            }`}
          >
            <MCSelect
              name={`experiences.${index}.startMonth`}
              placeholder={t("experienceForm.selectMonth")}
              options={months}
              size="small"
            />
            <MCSelect
              name={`experiences.${index}.startYear`}
              placeholder={t("experienceForm.selectYear")}
              options={years}
              size="small"
            />
          </div>
        </div>

        {/* Currently Working Here Checkbox */}
        <div className="flex items-center gap-3 pl-1">
          <Controller
            name={`experiences.${index}.isCurrently`}
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer transition-colors"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {t("experienceForm.currentlyWorking")}
                </span>
              </label>
            )}
          />
        </div>

        {/* End Date - Only show if NOT currently working */}
        {!isCurrently && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t("experienceForm.endDate")}
            </label>
            <div
              className={`grid ${
                isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"
              }`}
            >
              <MCSelect
                name={`experiences.${index}.endMonth`}
                placeholder={t("experienceForm.selectMonth")}
                options={months}
                size="small"
              />
              <MCSelect
                name={`experiences.${index}.endYear`}
                placeholder={t("experienceForm.selectYear")}
                options={years}
                size="small"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-4 pt-4 border-t border-primary/10">
        <MCButton
          type="button"
          variant="primary"
          size="m"
          onClick={handleSaveExperience}
          className="w-full flex items-center justify-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("experienceForm.saving", "Guardando...")}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t("experienceForm.saveExperience", "Guardar experiencia")}
            </>
          )}
        </MCButton>
      </div>
    </div>
  );
}

function ExperienceFields({ 
  isSaving, 
  onSaveExperience 
}: { 
  isSaving: boolean;
  onSaveExperience: (exp: ExperienceFormData) => Promise<number | undefined>;
}) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const { watch, setValue } = useFormContext();
  const experiences = watch("experiences") || [];
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const months = [
    { value: "01", label: t("months.january") },
    { value: "02", label: t("months.february") },
    { value: "03", label: t("months.march") },
    { value: "04", label: t("months.april") },
    { value: "05", label: t("months.may") },
    { value: "06", label: t("months.june") },
    { value: "07", label: t("months.july") },
    { value: "08", label: t("months.august") },
    { value: "09", label: t("months.september") },
    { value: "10", label: t("months.october") },
    { value: "11", label: t("months.november") },
    { value: "12", label: t("months.december") },
  ];

  const years = Array.from({ length: 50 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const addExperience = () => {
    const newExperiences = [
      ...experiences,
      {
        hospital: "",
        position: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        isCurrently: false,
      },
    ];
    setValue("experiences", newExperiences);
  };

  // Wrapper para pasar la experiencia al callback
  const handleSaveExperience = async (index: number) => {
    const exp = experiences[index];
    if (!exp) {
      throw new Error("Experiencia no encontrada");
    }
    
    const newId = await onSaveExperience(exp);
    
    // Si se creó una nueva experiencia con ID, actualizar el formulario
    if (newId && !exp.id) {
      const updatedExperiences = [...experiences];
      updatedExperiences[index] = { ...exp, id: newId };
      setValue("experiences", updatedExperiences);
    }
  };

  const confirmRemoveExperience = async () => {
    if (deleteIndex === null) return;

    const experienceToDelete = experiences[deleteIndex];

    try {
      setIsDeleting(true);

      // Si la experiencia tiene ID, eliminarla del backend
      if (experienceToDelete?.id) {
        await doctorService.deleteExperienciaLaboral(experienceToDelete.id);
        toast.success(
          t("experienceForm.deletedSuccessfully", "Experiencia eliminada exitosamente")
        );
        
        // Emitir evento para notificar cambios
        emitExperienceChanged();
      }

      // Eliminar del formulario
      const newExperiences = experiences.filter(
        (_: any, i: number) => i !== deleteIndex
      );
      setValue("experiences", newExperiences);
      setDeleteIndex(null);
    } catch (error) {
      console.error("❌ Error al eliminar experiencia laboral:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("experienceForm.errorDeleting", "Error al eliminar experiencia")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = (startIndex: number, finishIndex: number) => {
    const reordered = reorder({
      list: experiences,
      startIndex,
      finishIndex,
    });
    setValue("experiences", reordered);
  };

  // If no experiences, show add button
  if (!experiences.length) {
    return (
      <div className="flex flex-col gap-4">
        <MCButton
          type="button"
          variant="tercero"
          size="m"
          onClick={addExperience}
          className="w-full flex items-center gap-2"
          disabled={isSaving}
        >
          <Plus className="w-4 h-4" />
          {t("experienceForm.addExperience")}
        </MCButton>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {experiences.map((experience: ExperienceFormData, index: number) => (
          <DraggableExperienceCard
            key={experience.id || index}
            index={index}
            onDelete={setDeleteIndex}
            onSave={handleSaveExperience}
            onReorder={handleReorder}
            isMobile={isMobile}
            months={months}
            years={years}
            t={t}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <MCDialogBase
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title={t("experienceForm.confirmDeleteTitle")}
        onConfirm={confirmRemoveExperience}
        onSecondary={() => setDeleteIndex(null)}
        variant="warning"
        size="sm"
      >
        <p>
          {isDeleting
            ? t("experienceForm.deleting", "Eliminando...")
            : t("experienceForm.confirmDeleteDescription")}
        </p>
      </MCDialogBase>

      {/* Add Experience Button */}
      <MCButton
        type="button"
        variant="tercero"
        size="m"
        onClick={addExperience}
        className="w-full flex items-center gap-2 mt-4"
        disabled={isSaving}
      >
        <Plus className="w-4 h-4" />
        {t("experienceForm.addExperience")}
      </MCButton>
    </>
  );
}

function Experience(props: ExperienceProps) {
  void props;
  const { t, i18n } = useTranslation("doctor");
  const doctorExperience = useProfileStore((state) => state.doctorExperience);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceFormData[]>([]);

  // Función auxiliar para convertir fecha YYYY-MM a mes y año separados
  const parseDateToMonthYear = (dateStr: string | null): { month: string; year: string } => {
    if (!dateStr) return { month: "", year: "" };
    
    const match = dateStr.match(/^(\d{4})-(\d{2})/);
    if (match) {
      return { month: match[2], year: match[1] };
    }
    return { month: "", year: "" };
  };

  // Función auxiliar para convertir mes y año a formato YYYY-MM
  const formatMonthYearToDate = (month?: string, year?: string): string => {
    if (!month || !year) return "";
    return `${year}-${month}`;
  };

  // ✅ Cargar experiencias laborales del backend
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setIsLoading(true);
        const response = await doctorService.getExperienciasLaborales({
          target: i18n.language,
          translate_fields: "posicion,institucion,descripcion",
        });

        if (response.success && response.data.experiencias.length > 0) {
          // Mapear experiencias de la API al formato del formulario
          const mappedExperiences: ExperienceFormData[] = response.data.experiencias.map(
            (exp: ExperienciaLaboral) => {
              const startDate = parseDateToMonthYear(exp.fechaInicio);
              const endDate = parseDateToMonthYear(exp.fechaFinalizacion);

              return {
                id: exp.id,
                position: exp.posicion,
                hospital: exp.institucion,
                startMonth: startDate.month,
                startYear: startDate.year,
                endMonth: endDate.month,
                endYear: endDate.year,
                isCurrently: exp.trabajaActualmente,
              };
            }
          );

          setExperiences(mappedExperiences);
        }
      } catch (error) {
        console.error("❌ Error al cargar experiencias laborales:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : t("experienceForm.errorLoading", "Error al cargar experiencias laborales")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiences();
  }, [i18n.language, t]);

  // ✅ Guardar una experiencia laboral individual
  const handleSaveExperience = async (exp: ExperienceFormData): Promise<number | undefined> => {
    try {
      setIsSaving(true);

      if (!exp) {
        throw new Error("Experiencia no encontrada");
      }

      const experienceData = {
        posicion: exp.position,
        institucion: exp.hospital,
        fechaInicio: formatMonthYearToDate(exp.startMonth, exp.startYear),
        fechaFinalizacion: exp.isCurrently
          ? null
          : formatMonthYearToDate(exp.endMonth, exp.endYear),
        trabajaActualmente: exp.isCurrently || false,
      };

      if (exp.id) {
        // Actualizar experiencia existente
        await doctorService.updateExperienciaLaboral(exp.id, experienceData);
        toast.success(
          t("experienceForm.updatedSuccessfully", "Experiencia actualizada exitosamente")
        );
        return exp.id;
      } else {
        // Crear nueva experiencia
        const response = await doctorService.createExperienciaLaboral(experienceData);
        
        const newId = response.success && response.data?.id ? response.data.id : undefined;
        
        // Actualizar el ID en la lista local
        if (newId) {
          const updatedExperiences = experiences.map(e => 
            e === exp ? { ...exp, id: newId } : e
          );
          setExperiences(updatedExperiences);
        }
        
        toast.success(
          t("experienceForm.createdSuccessfully", "Experiencia creada exitosamente")
        );
        
        return newId;
      }
    } catch (error) {
      console.error("❌ Error al guardar experiencia laboral:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("experienceForm.errorSaving", "Error al guardar experiencia laboral")
      );
      throw error;
    } finally {
      setIsSaving(false);
      // Emitir evento para notificar cambios
      emitExperienceChanged();
    }
  };

  // Valores por defecto con experiencias cargadas
  const defaultValues = {
    experiences: experiences.length > 0 ? experiences : doctorExperience?.experiences || [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MCFormWrapper
      key={experiences.length} // Re-renderizar cuando cambien las experiencias cargadas
      schema={doctorExperienceSchema(t)}
      defaultValues={defaultValues}
      onSubmit={() => {}} // No se usa submit global
      className="flex flex-col gap-6"
    >
      <ExperienceFields 
        isSaving={isSaving}
        onSaveExperience={handleSaveExperience}
      />
    </MCFormWrapper>
  );
}

export default Experience;
