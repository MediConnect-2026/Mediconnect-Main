import { useState, useRef, useEffect } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { X, BookHeart, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { patientClinicalHistorySchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const ALLERGY_OPTIONS = [
  { value: "pollen", label: "Pollen" },
  { value: "penicillin", label: "Penicillin" },
  { value: "nuts", label: "Nuts" },
  { value: "latex", label: "Latex" },
  { value: "aspirin", label: "Aspirin" },
];

const CONDITION_OPTIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hypertension" },
  { value: "asthma", label: "Asthma" },
  { value: "heart_disease", label: "Heart Disease" },
  { value: "cancer", label: "Cancer" },
];

function ClinicalHistory() {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();
  const setPatientClinicalHistory = useProfileStore(
    (state) => state.setPatientClinicalHistory
  );

  const patientClinicalHistory = useProfileStore(
    (state) => state.patientClinicalHistory
  );

  const allergies = patientClinicalHistory?.allergies || [];
  const conditions = patientClinicalHistory?.conditions || [];

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingIndex !== null && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingIndex]);

  function handleSubmit(data: any) {
    console.log("Form submitted:", data);
  }

  function handleAddAllergy(value: string) {
    setPatientClinicalHistory({
      ...patientClinicalHistory,
      allergies: [...allergies, value],
    });
  }

  function handleRemoveAllergy(value: string) {
    setPatientClinicalHistory({
      ...patientClinicalHistory,
      allergies: allergies.filter((a) => a !== value),
    });
  }

  function handleAddCondition(value: string) {
    setPatientClinicalHistory({
      ...patientClinicalHistory,
      conditions: [...conditions, value],
    });
  }

  function handleRemoveCondition(idx: number) {
    setPatientClinicalHistory({
      ...patientClinicalHistory,
      conditions: conditions.filter((_, i) => i !== idx),
    });
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditingValue("");
    }
  }

  function handleEditCondition(idx: number) {
    setEditingIndex(idx);
    setEditingValue(conditions[idx]);
  }

  function handleConditionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditingValue(e.target.value);
  }

  function handleConditionBlur() {
    if (editingIndex !== null) {
      const updatedConditions = [...conditions];
      updatedConditions[editingIndex] = editingValue.trim();

      setPatientClinicalHistory({
        ...patientClinicalHistory,
        conditions: updatedConditions.filter((c) => c !== ""),
      });

      setEditingIndex(null);
      setEditingValue("");
    }
  }

  return (
    <MCFormWrapper
      schema={patientClinicalHistorySchema(t)}
      onSubmit={handleSubmit}
      className={`${isMobile ? "max-w-full" : "max-w-xl"} mx-auto ${
        isMobile ? "p-0" : "p-4"
      } flex flex-col gap-6`}
    >
      {/* Alert */}
      <div
        className={`border rounded-xl bg-red-100 ${
          isMobile ? "p-3" : "p-4"
        } flex flex-col gap-1`}
      >
        <div
          className={`flex items-center gap-2 text-red-700 font-semibold ${
            isMobile ? "text-base" : "text-lg"
          }`}
        >
          <BookHeart className={`${isMobile ? "text-base" : "text-xl"}`} />
          {t("clinicalHistory.importantTitle")}
        </div>
        <div className={`text-red-700 ${isMobile ? "text-sm" : "text-base"}`}>
          {t("clinicalHistory.importantDescription")}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h2
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-semibold text-red-700 mb-2`}
        >
          {t("clinicalHistory.allergies")}
        </h2>
        <div
          className={`border-2 border-dotted border-red-300 rounded-xl ${
            isMobile ? "p-3" : "p-4"
          } mb-2 min-h-[60px]`}
        >
          <div
            className={`flex flex-wrap ${isMobile ? "gap-1.5" : "gap-2"} mb-3`}
          >
            {allergies.map((a) => {
              const label =
                ALLERGY_OPTIONS.find((opt) => opt.value === a)?.label || a;
              return (
                <div
                  key={a}
                  className={`flex items-center gap-2 ${
                    isMobile ? "px-3 py-0.5" : "px-4 py-1"
                  } bg-red-600 text-white rounded-full ${
                    isMobile ? "text-sm" : "text-base"
                  } font-medium`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Heart
                      className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mb-0.5`}
                    />
                    <p>{label}</p>
                  </div>
                  <MCButton
                    variant="delete"
                    size="s"
                    onClick={() => handleRemoveAllergy(a)}
                    className="ml-1 rounded-full p-0.5"
                    aria-label={t("clinicalHistory.removeAllergy")}
                  >
                    <X size={isMobile ? 16 : 18} />
                  </MCButton>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("clinicalHistory.addAllergy")}
        </div>
        <MCSelect
          key={allergies.length}
          name="allergy"
          searchable={true}
          className="mb-4"
          placeholder={t("clinicalHistory.selectAllergy")}
          options={ALLERGY_OPTIONS.filter(
            (opt) => !allergies.includes(opt.value)
          )}
          onChange={(value) => {
            if (typeof value === "string") handleAddAllergy(value);
          }}
        />
      </div>

      {/* Conditions */}
      <div>
        <h2
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-semibold text-orange-500 mb-2`}
        >
          {t("clinicalHistory.conditions")}
        </h2>
        <div
          className={`border-2 border-dotted border-orange-300 rounded-xl ${
            isMobile ? "p-3" : "p-4"
          } flex flex-col ${isMobile ? "gap-2" : "gap-3"} mb-4 min-h-[60px]`}
        >
          {conditions.map((cond, idx) => {
            const label =
              CONDITION_OPTIONS.find((opt) => opt.value === cond)?.label ||
              cond;
            return editingIndex === idx ? (
              <div key={idx} className="flex items-center gap-2">
                <MCTextArea
                  name={`condition_${idx}`}
                  className={`border-2 border-orange-400 rounded-xl ${
                    isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"
                  } transition-all focus:border-orange-500`}
                  value={editingValue}
                  onBlur={handleConditionBlur}
                  onChange={handleConditionChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConditionBlur();
                    }
                  }}
                  placeholder={t("clinicalHistory.conditionPlaceholder")}
                />
                <MCButton
                  size="s"
                  onClick={() => handleRemoveCondition(idx)}
                  className="ml-1 rounded-full p-0.5 bg-transparent hover:bg-accent/70"
                  aria-label={t("clinicalHistory.removeCondition")}
                >
                  <X size={isMobile ? 16 : 18} className="text-white" />
                </MCButton>
              </div>
            ) : cond ? (
              <div
                key={idx}
                className={`flex items-center gap-2 ${
                  isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"
                } cursor-pointer border-2 border-orange-200 rounded-xl hover:border-orange-300 transition-all`}
                onClick={() => handleEditCondition(idx)}
              >
                <span className="flex-1">{label}</span>
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleRemoveCondition(idx);
                  }}
                  className="rounded-full p-1"
                  aria-label={t("clinicalHistory.removeCondition")}
                >
                  <X size={isMobile ? 16 : 18} />
                </button>
              </div>
            ) : null;
          })}
        </div>
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("clinicalHistory.addCondition")}
        </div>
        <MCSelect
          key={conditions.length}
          name="condition"
          searchable={true}
          className="mb-4"
          placeholder={t("clinicalHistory.conditionPlaceholder")}
          options={CONDITION_OPTIONS.filter(
            (opt) => !conditions.includes(opt.value)
          )}
          onChange={(value) => {
            if (typeof value === "string") handleAddCondition(value);
          }}
        />
      </div>
    </MCFormWrapper>
  );
}

export default ClinicalHistory;
