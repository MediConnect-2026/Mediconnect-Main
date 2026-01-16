import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { doctorEducationSchema } from "@/schema/profile.schema";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

interface EducationFormData {
  institution: string;
  degree: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

interface EducationProps {
  onOpenChange: (open: boolean) => void;
}

interface DraggableEducationCardProps {
  education: EducationFormData;
  index: number;
  onDelete: (index: number) => void;
  isMobile: boolean;
  months: Array<{ value: string; label: string }>;
  years: Array<{ value: string; label: string }>;
  t: any;
}

function DraggableEducationCard({
  education,
  index,
  onDelete,
  onReorder,
  isMobile,
  months,
  years,
  t,
}: DraggableEducationCardProps & {
  onReorder: (startIndex: number, finishIndex: number) => void;
}) {
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
      })
    );
  }, [index, onReorder]);

  return (
    <div
      ref={ref}
      className={`relative rounded-3xl border p-4 bg-white transition-all ${
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
        <MCInput
          name={`educations.${index}.degree`}
          label={t("educationForm.degree")}
          type="text"
          size="small"
          placeholder={t("educationForm.degreePlaceholder")}
        />

        <MCInput
          name={`educations.${index}.institution`}
          label={t("educationForm.institution")}
          type="text"
          size="small"
          placeholder={t("educationForm.institutionPlaceholder")}
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

        {/* End Date */}
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
      </div>
    </div>
  );
}

function EducationFields() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const { watch, setValue } = useFormContext();
  const educations = watch("educations") || [];
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

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

  const addEducation = () => {
    const newEducations = [
      ...educations,
      {
        institution: "",
        degree: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
      },
    ];
    setValue("educations", newEducations);
  };

  const confirmRemoveEducation = () => {
    if (deleteIndex !== null && educations.length > 0) {
      const newEducations = educations.filter(
        (_: any, i: number) => i !== deleteIndex
      );
      setValue("educations", newEducations);
      setDeleteIndex(null);
    }
  };

  const handleReorder = (startIndex: number, finishIndex: number) => {
    const reordered = reorder({
      list: educations,
      startIndex,
      finishIndex,
    });
    setValue("educations", reordered);
  };

  // If no educations, show add button
  if (!educations.length) {
    return (
      <div className="flex flex-col gap-4">
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
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {educations.map((education: EducationFormData, index: number) => (
          <DraggableEducationCard
            key={index}
            education={education}
            index={index}
            onDelete={setDeleteIndex}
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
        title={t("educationForm.confirmDeleteTitle")}
        onConfirm={confirmRemoveEducation}
        onSecondary={() => setDeleteIndex(null)}
        variant="warning"
        size="sm"
      >
        <p>{t("educationForm.confirmDeleteDescription")}</p>
      </MCDialogBase>

      {/* Add Education Button */}
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
    </>
  );
}

function Education({ onOpenChange }: EducationProps) {
  const { t } = useTranslation("doctor");
  const setDoctorEducation = useProfileStore(
    (state) => state.setDoctorEducation
  );
  const doctorEducation = useProfileStore((state) => state.doctorEducation);

  const defaultValues = {
    educations: doctorEducation?.educations || [],
  };

  return (
    <MCFormWrapper
      schema={doctorEducationSchema(t)}
      defaultValues={defaultValues}
      onSubmit={(data) => {
        setDoctorEducation(data);
        onOpenChange(false);
      }}
      className="flex flex-col gap-6"
    >
      <EducationFields />
    </MCFormWrapper>
  );
}

export default Education;
