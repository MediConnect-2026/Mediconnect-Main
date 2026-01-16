import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { doctorExperienceSchema } from "@/schema/profile.schema";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState, useRef } from "react";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

interface ExperienceFormData {
  hospital: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

interface ExperienceProps {
  onOpenChange: (open: boolean) => void;
}

interface DraggableExperienceCardProps {
  experience: ExperienceFormData;
  index: number;
  onDelete: (index: number) => void;
  isMobile: boolean;
  months: Array<{ value: string; label: string }>;
  years: Array<{ value: string; label: string }>;
  t: any;
}

function DraggableExperienceCard({
  experience,
  index,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isMobile,
  months,
  years,
  t,
}: DraggableExperienceCardProps & {
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => {
        setIsDragging(true);
        onDragStart(index);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        onDragOver(index);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(index);
      }}
      className={`relative rounded-3xl border p-4 bg-white transition-all cursor-move ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${isOver ? "border-primary border-2 shadow-lg" : "border-primary/10"}`}
    >
      {/* Header Row: Drag, Title, Delete */}
      <div className="flex items-center justify-between pb-4">
        {/* Drag Handle */}
        <button
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

        {/* End Date */}
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
      </div>
    </div>
  );
}

function ExperienceFields() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const { watch, setValue } = useFormContext();
  const experiences = watch("experiences") || [];
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (_: number) => {};
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const newExperiences = [...experiences];
    const [draggedItem] = newExperiences.splice(draggedIndex, 1);
    newExperiences.splice(dropIndex, 0, draggedItem);
    setValue("experiences", newExperiences);
    setDraggedIndex(null);
  };

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
      },
    ];
    setValue("experiences", newExperiences);
  };

  const confirmRemoveExperience = () => {
    if (deleteIndex !== null && experiences.length > 0) {
      const newExperiences = experiences.filter(
        (_: any, i: number) => i !== deleteIndex
      );
      setValue("experiences", newExperiences);
      setDeleteIndex(null);
    }
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
            key={index}
            experience={experience}
            index={index}
            onDelete={setDeleteIndex}
            isMobile={isMobile}
            months={months}
            years={years}
            t={t}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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
        <p>{t("experienceForm.confirmDeleteDescription")}</p>
      </MCDialogBase>

      {/* Add Experience Button */}
      <MCButton
        type="button"
        variant="tercero"
        size="m"
        onClick={addExperience}
        className="w-full flex items-center gap-2 mt-4"
      >
        <Plus className="w-4 h-4" />
        {t("experienceForm.addExperience")}
      </MCButton>
    </>
  );
}

function Experience({ onOpenChange }: ExperienceProps) {
  const { t } = useTranslation("doctor");
  const setDoctorExperience = useProfileStore(
    (state) => state.setDoctorExperience
  );
  const doctorExperience = useProfileStore((state) => state.doctorExperience);

  const defaultValues = {
    experiences: doctorExperience?.experiences || [],
  };

  return (
    <MCFormWrapper
      schema={doctorExperienceSchema(t)}
      defaultValues={defaultValues}
      onSubmit={(data) => {
        setDoctorExperience(data);
        onOpenChange(false);
      }}
      className="flex flex-col gap-6"
    >
      <ExperienceFields />
    </MCFormWrapper>
  );
}

export default Experience;
