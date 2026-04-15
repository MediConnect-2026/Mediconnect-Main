import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { doctorEducationSchema } from "@/schema/profile.schema";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { educationService } from "./services/education.service";
import type { FormacionAcademicaBackend, Pais, Universidad } from "./services/education.types";
import { toast } from "sonner";
import { emitAcademicChanged } from "@/lib/events/academicFormation";

interface EducationFormData {
  id?: number;
  institution: string;
  degree: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent?: boolean;
  paisId: string;
}

interface DraggableEducationCardProps {
  education: EducationFormData;
  index: number;
  onDelete: (index: number) => void;
  onSave: (index: number, educationData: EducationFormData) => Promise<void>;
  onReorder: (startIndex: number, finishIndex: number) => void;
  isMobile: boolean;
  months: Array<{ value: string; label: string }>;
  years: Array<{ value: string; label: string }>;
  t: any;
  paises: Array<{ value: string; label: string }>;
  universidades: Array<{ value: string; label: string }>;
  onPaisChange: (index: number, paisId: string) => void;
  onUniversidadChange: (index: number, universidadId: string) => void;
}

function DraggableEducationCard({
  index,
  onDelete,
  onSave,
  onReorder,
  isMobile,
  months,
  years,
  t,
  paises,
  universidades,
  onPaisChange,
  onUniversidadChange,
}: DraggableEducationCardProps) {
  const { trigger, watch, setValue } = useFormContext();
  const [isSaving, setIsSaving] = useState(false);
  const isCurrent = watch(`educations.${index}.isCurrent`);

  // Limpiar fechas de fin si está en curso
  useEffect(() => {
    if (isCurrent) {
      setValue(`educations.${index}.endMonth`, "");
      setValue(`educations.${index}.endYear`, "");
    }
  }, [isCurrent, index, setValue]);

  const handleSaveEducation = useCallback(async () => {
    // Validar solo los campos de esta formación
    const fieldsToValidate = [
      `educations.${index}.paisId`,
      `educations.${index}.institution`,
      `educations.${index}.degree`,
      `educations.${index}.startMonth`,
      `educations.${index}.startYear`,
    ] as const;
    const additionalFields = !isCurrent 
      ? [`educations.${index}.endMonth`, `educations.${index}.endYear`] as const
      : [];
    const allFields = [...fieldsToValidate, ...additionalFields];
    const isValid = await trigger(allFields as any);
    if (isValid) {
      // Validación de fechas: endYear-endMonth >= startYear-startMonth
      const educationData = watch(`educations.${index}`);
      if (!isCurrent && educationData.endYear && educationData.endMonth && educationData.startYear && educationData.startMonth) {
        const start = parseInt(educationData.startYear + educationData.startMonth);
        const end = parseInt(educationData.endYear + educationData.endMonth);
        if (end < start) {
          toast.error(t("educationForm.invalidEndDate", "La fecha de finalización no puede ser menor que la fecha de inicio."));
          return;
        }
      }
      setIsSaving(true);
      try {
        await onSave(index, educationData);
      } catch (error) {
        console.error("Error saving education:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [index, isCurrent, trigger, onSave, t, watch]);

  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

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

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(`educations.${index}.isCurrent`, e.target.checked);
  }, [index, setValue]);

  const handlePaisSelectChange = useCallback((val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] : val;
    onPaisChange(index, id);
  }, [index, onPaisChange]);

  const handleUniversidadSelectChange = useCallback((val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] : val;
    onUniversidadChange(index, id);
  }, [index, onUniversidadChange]);

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
          aria-label={t("educationForm.dragHandle")}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Education Title */}
        <h3 className="text-lg font-semibold text-primary flex-1 text-center">
          {t("educationForm.educationTitle")} {index + 1}
        </h3>

        {/* Delete Button */}
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors ml-2"
          onClick={() => onDelete(index)}
          aria-label={t("educationForm.deleteEducation")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 pl-2">
        <MCSelect
          name={`educations.${index}.paisId`}
          label={t("educationForm.country")}
          placeholder={t("educationForm.selectCountry")}
          options={paises}
          size="small"
          onChange={handlePaisSelectChange}
          searchable
        />
        <MCSelect
          name={`educations.${index}.institution`}
          label={t("educationForm.university")}
          placeholder={t("educationForm.selectUniversity")}
          options={universidades}
          size="small"
          onChange={handleUniversidadSelectChange}
          searchable
        />
        <MCInput
          name={`educations.${index}.degree`}
          label={t("educationForm.degree")}
          type="text"
          size="small"
          placeholder={t("educationForm.degreePlaceholder")}
        />
        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("educationForm.startDate")}
          </label>
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"
            }`}
          >
            <MCSelect
              name={`educations.${index}.startMonth`}
              placeholder={t("educationForm.selectMonth")}
              options={months}
              size="small"
            />
            <MCSelect
              name={`educations.${index}.startYear`}
              placeholder={t("educationForm.selectYear")}
              options={years}
              size="small"
            />
          </div>
        </div>
        {/* En curso Checkbox y End Date */}
        <div className="flex items-center gap-3 pl-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isCurrent || false}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer transition-colors"
            />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {t("educationForm.currentlyStudying", "Actualmente cursando")}
            </span>
          </label>
        </div>
        {!isCurrent && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t("educationForm.endDate")}
            </label>
            <div
              className={`grid ${
                isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"
              }`}
            >
              <MCSelect
                name={`educations.${index}.endMonth`}
                placeholder={t("educationForm.selectMonth")}
                options={months}
                size="small"
              />
              <MCSelect
                name={`educations.${index}.endYear`}
                placeholder={t("educationForm.selectYear")}
                options={years}
                size="small"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-4 pt-4 border-t border-primary/10">
          <MCButton
            type="button"
            variant="primary"
            size="m"
            onClick={handleSaveEducation}
            className="w-full flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("educationForm.saving", "Guardando...")}
              </>
            ) : (
              <>
                <GripVertical className="w-4 h-4" />
                {t("educationForm.saveEducation", "Guardar formación")}
              </>
            )}
          </MCButton>
        </div>
      </div>
    </div>
  );
}

function parseDateToMonthYear(dateStr: string | null): { month: string; year: string } {
  if (!dateStr) return { month: "", year: "" };
  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  if (match) {
    return { month: match[2], year: match[1] };
  }
  return { month: "", year: "" };
}

function Education() {
  const { t, i18n } = useTranslation("doctor");
  const setDoctorEducation = useProfileStore((state) => state.setDoctorEducation);
  const [isLoading, setIsLoading] = useState(true);
  const [educations, setEducations] = useState<EducationFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [universidadesPorPais, setUniversidadesPorPais] = useState<Record<string, Universidad[]>>({});
  const [universidadesSeleccionadas, setUniversidadesSeleccionadas] = useState<Record<number, Universidad[]>>({});
  const isMobile = useIsMobile();
  const [isSaving, setIsSaving] = useState(false);

  // Cargar países
  useEffect(() => {
    const loadPaises = async () => {
      try {
        const res = await educationService.getPaises({ target: i18n.language });
        if (res.success && Array.isArray(res.data.paises)) {
          setPaises(res.data.paises);
        }
      } catch (e) {
        console.error("Error loading countries:", e);
      }
    };
    loadPaises();
  }, [i18n.language]);

  useEffect(() => {
    if (educations.length === 0) return;

    const loadUniversidadesIniciales = async () => {
      const paisesUnicos = [...new Set(educations.map((e) => e.paisId).filter(Boolean))];

      for (const paisId of paisesUnicos) {
        if (universidadesPorPais[paisId]) continue; // ya cargadas, no repetir

        try {
          const res = await educationService.getUniversidadesByPais(Number(paisId), {
            target: i18n.language,
          });
          if (res.success && Array.isArray(res.data)) {
            setUniversidadesPorPais((prev) => ({ ...prev, [paisId]: res.data }));

            // También poblar universidadesSeleccionadas por índice
            educations.forEach((edu, index) => {
              if (edu.paisId === paisId) {
                setUniversidadesSeleccionadas((prev) => ({ ...prev, [index]: res.data }));
              }
            });
          }
        } catch (e) {
          console.error("Error cargando universidades iniciales:", e);
        }
      }
    };

    loadUniversidadesIniciales();
  }, [educations, i18n.language]);

  // Cargar formaciones académicas del backend
  useEffect(() => {
    const loadEducations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await educationService.getFormacionesAcademicas({
          target: i18n.language,
          translate_fields: "nombre",
        });
        
        if (response.success && Array.isArray(response.data.formaciones)) {
          const mapped: EducationFormData[] = response.data.formaciones.map((edu: FormacionAcademicaBackend) => {
            const start = parseDateToMonthYear(edu.fechaInicio);
            const end = parseDateToMonthYear(edu.fechaFinalizacion);

            return {
              id: edu.id,
              paisId: edu.universidad.paisId ? String(edu.universidad.paisId) : "",
              institution: edu.universidadId ? String(edu.universidadId) : "",
              degree: edu.nombre,
              startMonth: start.month,
              startYear: start.year,
              endMonth: edu.enCurso ? "" : end.month,
              endYear: edu.enCurso ? "" : end.year,
              isCurrent: edu.enCurso,
            };
          });
          setEducations(mapped);
          setDoctorEducation({ educations: mapped });
        } else {
          setEducations([]);
          setDoctorEducation({ educations: [] });
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Error al cargar formaciones académicas";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    loadEducations();
  }, [i18n.language, setDoctorEducation]);

  // Cargar universidades para cada país seleccionado
  const handlePaisChange = useCallback(async (index: number, paisId: string) => {
    if (!paisId) return;
    try {
      const res = await educationService.getUniversidadesByPais(Number(paisId), { target: i18n.language });
      if (res.success && Array.isArray(res.data)) {
        setUniversidadesPorPais((prev) => ({ ...prev, [paisId]: res.data }));
        setUniversidadesSeleccionadas((prev) => ({ ...prev, [index]: res.data }));
        // Limpiar universidad seleccionada si cambia país
        setEducations((prev) => {
          const newEducations = [...prev];
          newEducations[index] = {
            ...newEducations[index],
            institution: "",
            paisId,
          };
          return newEducations;
        });
      }
    } catch (e) {
      console.error("Error loading universities:", e);
    }
  }, [i18n.language]);

  const handleUniversidadChange = useCallback((index: number, universidadId: string) => {
    setEducations((prev) => {
      const newEducations = [...prev];
      newEducations[index] = {
        ...newEducations[index],
        institution: universidadId,
      };
      return newEducations;
    });
  }, []);

  const months = useMemo(() => [
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
  ], [t]);

  const years = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    });
  }, []);

  const paisesOptions = useMemo(() => 
    paises.map((p) => ({ value: String(p.id), label: p.nombre })),
    [paises]
  );

  const addEducation = useCallback(() => {
    setEducations((prev) => [
      ...prev,
      {
        institution: "",
        degree: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        paisId: "",
      },
    ]);
  }, []);

  const handleReorder = useCallback((startIndex: number, finishIndex: number) => {
    setEducations((prev) => {
      const reordered = reorder({
        list: prev,
        startIndex,
        finishIndex,
      });
      setDoctorEducation({ educations: reordered });
      return reordered;
    });
  }, [setDoctorEducation]);

  // Guardar (crear o actualizar) una formación académica
  const handleSaveEducation = useCallback(async (index: number, edu: EducationFormData): Promise<void> => {
    try {
      setIsSaving(true);
      if (!edu) throw new Error("Formación no encontrada");
      const data = {
        universidadId: Number(edu.institution),
        nombre: edu.degree,
        fechaInicio: `${edu.startYear}-${edu.startMonth}-01`,
        fechaFinalizacion: edu.endYear && edu.endMonth ? `${edu.endYear}-${edu.endMonth}-28` : null,
        enCurso: edu.isCurrent || (!edu.endYear || !edu.endMonth),
        estado: "Activo" as const,
      };
      console.log("Saving education with data:", data);
      let newId = edu.id;
      if (edu.id) {
        await educationService.updateFormacionAcademica(edu.id, data);
        toast.success(t("educationForm.updatedSuccessfully", "Formación actualizada exitosamente"));
      } else {
        const response = await educationService.createFormacionAcademica(data);
        newId = response.success && response.data?.id ? response.data.id : undefined;
        if (newId) {
          setEducations((prev) => {
            const updated = [...prev];
            updated[index] = { ...edu, id: newId };
            return updated;
          });
        }
        toast.success(t("educationForm.createdSuccessfully", "Formación creada exitosamente"));
      }
      // Actualizar store global
      setDoctorEducation({ 
        educations: educations.map((e, i) => i === index ? { ...edu, id: newId } : e) 
      });
    } catch (error: any) {
      const errorMessage = error?.message || t("educationForm.errorSaving", "Error al guardar formación académica");
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
      emitAcademicChanged(); // Emitir evento para notificar cambios en formaciones académicas
    }
  }, [educations, t, setDoctorEducation]);

  // Eliminar formación académica (backend)
  const handleDeleteEducation = useCallback(async () => {
    if (deleteIndex === null) return;
    const eduToDelete = educations[deleteIndex];
    try {
      setIsSaving(true);
      if (eduToDelete?.id) {
        await educationService.deleteFormacionAcademica(eduToDelete.id);
        toast.success(t("educationForm.deletedSuccessfully", "Formación eliminada exitosamente"));
      }
      
      emitAcademicChanged(); // Emitir evento para notificar cambios en formaciones académicas

      setEducations((prev) => {
        const newEducations = prev.filter((_, i) => i !== deleteIndex);
        setDoctorEducation({ educations: newEducations });
        return newEducations;
      });
      setDeleteIndex(null);
      
    } catch (error: any) {
      const errorMessage = error?.message || t("educationForm.errorDeleting", "Error al eliminar formación académica");
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [deleteIndex, educations, t, setDoctorEducation]);

  const defaultValues = useMemo(() => ({
    educations: educations,
  }), [educations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <MCFormWrapper
      key={educations.length}
      schema={doctorEducationSchema(t)}
      defaultValues={defaultValues}
      onSubmit={() => {}}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        {educations.length === 0 ? (
          <MCButton
            type="button"
            variant="tercero"
            size="m"
            onClick={addEducation}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("educationForm.addEducation")}
          </MCButton>
        ) : (
          educations.map((education: EducationFormData, index: number) => {
            const paisId = education.paisId || "";
            let universidades: Universidad[] = [];
            
            if (paisId && universidadesPorPais[paisId]) {
              universidades = universidadesPorPais[paisId];
            } else if (universidadesSeleccionadas[index]) {
              universidades = universidadesSeleccionadas[index];
            }
            
            const universidadesOptions = universidades.map((u) => ({ 
              value: String(u.id), 
              label: u.nombre 
            }));
            
            return (
              <DraggableEducationCard
                key={education.id || `education-${index}`}
                education={education}
                index={index}
                onDelete={setDeleteIndex}
                onSave={handleSaveEducation}
                onReorder={handleReorder}
                isMobile={isMobile}
                months={months}
                years={years}
                t={t}
                paises={paisesOptions}
                universidades={universidadesOptions}
                onPaisChange={handlePaisChange}
                onUniversidadChange={handleUniversidadChange}
              />
            );
          })
        )}
      </div>
      
      <MCDialogBase
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title={t("educationForm.confirmDeleteTitle")}
        onConfirm={handleDeleteEducation}
        onSecondary={() => setDeleteIndex(null)}
        variant="warning"
        size="sm"
      >
        <p>
          {isSaving 
            ? t("educationForm.deleting", "Eliminando...") 
            : t("educationForm.confirmDeleteDescription")
          }
        </p>
      </MCDialogBase>
      
      {educations.length > 0 && (
        <MCButton
          type="button"
          variant="tercero"
          size="m"
          onClick={addEducation}
          className="w-full flex items-center gap-2 mt-4"
        >
          <Plus className="w-4 h-4" />
          {t("educationForm.addEducation")}
        </MCButton>
      )}
    </MCFormWrapper>
  );
}

export default Education;