import { useMemo, useState } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCInput from "@/shared/components/forms/MCInput";
import { X, BookHeart, Heart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { patientClinicalHistorySchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  useAvailableAllergies,
  useMyAllergies,
  useMyConditions,
  useAddAllergy,
  useRemoveAllergy,
  useUpdateCondition,
  useAddPersonalCondition,
  useRemoveCondition,
} from "./hooks";

interface ClinicalHistoryProps {
  onClinicalHistoryChanged?: () => void;
}

function ClinicalHistory({ onClinicalHistoryChanged }: ClinicalHistoryProps) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();

  // React Query hooks para datos
  const { data: availableAllergies = [], isLoading: isLoadingAllergies } =
    useAvailableAllergies();
  const { data: myAllergies = [] } = useMyAllergies();
  const { data: myConditions = [], isLoading: isLoadingConditions } =
    useMyConditions();

  // Mutation hooks
  const addAllergy = useAddAllergy();
  const removeAllergy = useRemoveAllergy();
  const updateCondition = useUpdateCondition();
  const addPersonalCondition = useAddPersonalCondition();
  const removeCondition = useRemoveCondition();

  // Estados locales solo para la UI de edición
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [personalCondition, setPersonalCondition] = useState<string>("");

  // Estado de carga global (cualquier mutación en progreso)
  const isSubmitting =
    addAllergy.isPending ||
    removeAllergy.isPending ||
    updateCondition.isPending ||
    addPersonalCondition.isPending ||
    removeCondition.isPending;

  const availableAllergyOptions = useMemo(
    () =>
      availableAllergies.filter(
        (allergy) => !myAllergies.some((a) => a.id === allergy.id),
      ),
    [availableAllergies, myAllergies],
  );

  function handleSubmit(data: any) {
    console.log("Form submitted:", data);
  }

  async function handleAddAllergy(value: string) {
    const condicionId = parseInt(value);
    await addAllergy.mutateAsync({ condicionId });
    onClinicalHistoryChanged?.();
  }

  async function handleAddPersonalCondition() {
    const trimmedValue = personalCondition.trim();

    if (!trimmedValue) {
      return;
    }

    await addPersonalCondition.mutateAsync({ notas: trimmedValue });
    setPersonalCondition("");
    onClinicalHistoryChanged?.();
  }

  async function handleRemoveAllergy(condicionId: number) {
    await removeAllergy.mutateAsync(condicionId);
    onClinicalHistoryChanged?.();
  }

  async function handleRemoveCondition(idx: number) {
    const condition = myConditions[idx];
    await removeCondition.mutateAsync(condition.id);

    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditingValue("");
    }

    onClinicalHistoryChanged?.();
  }

  function handleEditCondition(idx: number) {
    setEditingIndex(idx);
    setEditingValue(myConditions[idx].notas || "");
  }

  function handleConditionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditingValue(e.target.value);
  }

  async function handleConditionBlur() {
    if (editingIndex !== null) {
      const trimmedValue = editingValue.trim();
      const condition = myConditions[editingIndex];

      // Si las notas no han cambiado, solo salir del modo de edición
      if (trimmedValue === (condition.notas || "")) {
        setEditingIndex(null);
        setEditingValue("");
        return;
      }

      // Actualizar la condición con nuevas notas
      await updateCondition.mutateAsync({
        condicionId: condition.id,
        notas: trimmedValue,
        estado: "Activo",
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
          {isLoadingAllergies ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
          ) : (
            <div
              className={`flex flex-wrap ${isMobile ? "gap-1.5" : "gap-2"} mb-3`}
            >
              {myAllergies.map((allergy) => (
                <div
                  key={allergy.id}
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
                    <p>{allergy.nombre}</p>
                  </div>
                  <MCButton
                    variant="delete"
                    size="s"
                    onClick={() => handleRemoveAllergy(allergy.id)}
                    className="ml-1 rounded-full p-0.5"
                    aria-label={t("clinicalHistory.removeAllergy")}
                    disabled={isSubmitting}
                  >
                    <X size={isMobile ? 16 : 18} />
                  </MCButton>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("clinicalHistory.addAllergy")}
        </div>
        <MCSelect
          key={myAllergies.length}
          name="allergy"
          searchable={true}
          className="mb-4"
          placeholder={t("clinicalHistory.selectAllergy")}
          options={availableAllergyOptions}
          onChange={(value) => {
            if (typeof value === "string") handleAddAllergy(value);
          }}
          disabled={isLoadingAllergies || isSubmitting}
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
          {isLoadingConditions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : (
            myConditions.map((condition, idx) => {
              return editingIndex === idx ? (
                <div key={condition.id} className="flex items-center gap-2">
                  <MCTextArea
                    name={`condition_${condition.id}`}
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
                      } else if (e.key === "Escape") {
                        setEditingIndex(null);
                        setEditingValue("");
                      }
                    }}
                    placeholder={t("clinicalHistory.conditionPlaceholder")}
                    disabled={isSubmitting}
                  />
                  <MCButton
                    size="s"
                    onClick={() => handleRemoveCondition(idx)}
                    className="rounded-full p-1 hover:bg-red-500 hover:opacity-80 bg-transparent"
                    aria-label={t("clinicalHistory.removeCondition")}
                    disabled={isSubmitting}
                  >
                    <X size={isMobile ? 16 : 18} className="text-white " />
                  </MCButton>
                </div>
              ) : (
                <div
                  key={condition.id}
                  className={`flex items-center gap-2 ${
                    isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"
                  } cursor-pointer border-2 border-orange-200 rounded-xl hover:border-orange-300 transition-all`}
                  onClick={() => handleEditCondition(idx)}
                >
                  <div className="flex-1 flex flex-col gap-1">
                    {/* Mostrar título "Condición Personal" o "Personal status" con las notas */}
                    {condition.nombre.startsWith("Condición Personal") ||
                    condition.nombre.startsWith("Personal status") ? (
                      <>
                        <span className="font-semibold">
                          {t(
                            "clinicalHistory.personalConditionTitle",
                            "Condición Personal",
                          )}
                        </span>
                        {condition.notas && (
                          <span className="text-sm text-muted-foreground">
                            {condition.notas}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">
                          {condition.nombre}
                        </span>
                        {condition.notas && (
                          <span className="text-sm text-muted-foreground">
                            {condition.notas}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleRemoveCondition(idx);
                    }}
                    className="rounded-full p-1 hover:bg-red-500 hover:opacity-80"
                    aria-label={t("clinicalHistory.removeCondition")}
                    disabled={isSubmitting}
                  >
                    <X size={isMobile ? 16 : 18} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span
            className={`text-gray-500 ${isMobile ? "text-sm" : "text-base"}`}
          >
            {t("clinicalHistory.or", "o")}
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Input para condición personal */}
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t(
            "clinicalHistory.addPersonalCondition",
            "Agregar condición médica personal",
          )}
        </div>
        <div className="flex items-center gap-2">
          <MCInput
            name="personalCondition"
            standalone={true}
            placeholder={t(
              "clinicalHistory.personalConditionPlaceholder",
              "Escribe tu condición médica",
            )}
            value={personalCondition}
            onChange={(e) => setPersonalCondition(e.target.value)}
            disabled={isSubmitting}
            className="flex-1"
          />
          <MCButton
            variant="primary"
            size="m"
            onClick={handleAddPersonalCondition}
            disabled={isSubmitting || !personalCondition.trim()}
            className={`${isMobile ? "px-4" : "px-6"} whitespace-nowrap`}
          >
            {t("clinicalHistory.add", "Agregar")}
          </MCButton>
        </div>
      </div>
    </MCFormWrapper>
  );
}

export default ClinicalHistory;
