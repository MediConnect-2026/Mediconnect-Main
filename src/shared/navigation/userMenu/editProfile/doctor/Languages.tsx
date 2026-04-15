import { useState, useEffect } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { X, Languages as LanguagesIcon, Loader2, Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { doctorLanguageSchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { doctorService } from "./services/doctor.service";
import type { Idioma } from "./services/doctor.types";
import { toast } from "sonner";
import { emitDoctorLanguageChanged } from "@/lib/events/languageEvents";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { AVAILABLE_LANGUAGES, PROFICIENCY_LEVELS } from "@/features/onboarding/constants/languages.constants";

function LanguagesTab() {
  const { t, i18n } = useTranslation("doctor");
  const isMobile = useIsMobile();

  // Estados para las listas de idiomas
  const [doctorLanguages, setDoctorLanguages] = useState<Idioma[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);

  // Estados de carga
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para editar nivel de dominio
  const [editingLanguage, setEditingLanguage] = useState<Idioma | null>(null);
  const [editProficiency, setEditProficiency] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadLanguagesData();
  }, []);

  async function loadLanguagesData() {
    try {
      setIsLoadingLanguages(true);
      const response = await doctorService.getDoctorLanguages();

      if (response.success) {
        setDoctorLanguages(response.data);
      }
    } catch (error) {
      console.error("Error al cargar idiomas:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("languages.errorLoading", "Error al cargar idiomas")
      );
    } finally {
      setIsLoadingLanguages(false);
    }
  }

  const handleSubmit = () => {
    console.log("Language data submitted:");
  };

  async function handleAddLanguage() {
    if (!selectedLanguage || !selectedProficiency) {
      toast.error(t("languages.selectBoth", "Por favor selecciona el idioma y el nivel de dominio"));
      return;
    }

    // Obtener nombres en lugar de IDs
    const languageName = AVAILABLE_LANGUAGES.find(
      lang => lang.value === selectedLanguage
    )?.label;
    
    const proficiencyLevel = PROFICIENCY_LEVELS.find(
      level => level.value === selectedProficiency
    );
    const proficiencyName = i18n.language === 'en' ? proficiencyLevel?.labelEn : proficiencyLevel?.label;
    
    if (!languageName || !proficiencyName) {
      toast.error(t("languages.errorInvalidSelection", "Selección inválida"));
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await doctorService.addDoctorLanguage({ 
        nombre: languageName, 
        nivel: proficiencyName 
      });

      if (response.success) {
        const updatedLanguages = [...doctorLanguages, response.data];
        setDoctorLanguages(updatedLanguages);
        
        toast.success(
          t("languages.added", "Idioma agregado exitosamente") || response.message
        );
        
        // Resetear selecciones
        setSelectedLanguage(null);
        setSelectedProficiency(null);
        
        // Emitir evento de cambio en idiomas
        emitDoctorLanguageChanged();
      }
    } catch (error) {
      console.error("Error al agregar idioma:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("languages.errorAdding", "Error al agregar idioma")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveLanguage(id: number) {
    try {
      setIsSubmitting(true);
      const response = await doctorService.deleteDoctorLanguage(id);

      if (response.success) {
        const updatedLanguages = doctorLanguages.filter(l => l.id !== id);
        setDoctorLanguages(updatedLanguages);
        toast.success(
          t("languages.removed", "Idioma eliminado exitosamente") || response.message
        );
        
        // Emitir evento de cambio en idiomas
        emitDoctorLanguageChanged();
      }
    } catch (error) {
      console.error("Error al eliminar idioma:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("languages.errorRemoving", "Error al eliminar idioma")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenEditDialog(language: Idioma) {
    setEditingLanguage(language);
    // Encontrar el nivel por nombre
    const proficiencyLevel = PROFICIENCY_LEVELS.find(
      p => p.label === language.nivel || p.labelEn === language.nivel
    );
    setEditProficiency(proficiencyLevel?.value || null);
    setIsEditDialogOpen(true);
  }

  async function handleUpdateProficiency() {
    if (!editingLanguage || !editProficiency) return;

    // Obtener nombre del nivel de dominio
    const proficiencyLevel = PROFICIENCY_LEVELS.find(
      level => level.value === editProficiency
    );
    const proficiencyName = i18n.language === 'en' ? proficiencyLevel?.labelEn : proficiencyLevel?.label;
    
    if (!proficiencyName) {
      toast.error(t("languages.errorInvalidSelection", "Selección inválida"));
      return;
    }

    try {
      setIsUpdating(true);
      const response = await doctorService.updateDoctorLanguage(
        editingLanguage.id,
        { nivel: proficiencyName }
      );

      if (response.success) {
        // Actualizar la lista local
        const updatedLanguages = doctorLanguages.map(l => 
          l.id === editingLanguage.id ? response.data : l
        );
        setDoctorLanguages(updatedLanguages);
        
        toast.success(
          t("languages.updated", "Nivel de dominio actualizado exitosamente") || response.message
        );
        
        // Cerrar diálogo
        setIsEditDialogOpen(false);
        setEditingLanguage(null);
        setEditProficiency(null);
        
        // Emitir evento de cambio
        emitDoctorLanguageChanged();
      }
    } catch (error) {
      console.error("Error al actualizar nivel de dominio:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("languages.errorUpdating", "Error al actualizar nivel de dominio")
      );
    } finally {
      setIsUpdating(false);
    }
  }

  // Filtrar idiomas disponibles (excluir los que ya tiene el doctor)
  const availableLanguages = AVAILABLE_LANGUAGES.filter(
    lang => !doctorLanguages.some(dl => dl.nombre === lang.label)
  ).map(lang => ({
    value: lang.value,
    label: i18n.language === 'en' ? lang.labelEn : lang.label,
  }));

  // Obtener niveles de dominio según el idioma actual
  const proficiencyOptions = PROFICIENCY_LEVELS.map(level => ({
    value: level.value,
    label: i18n.language === 'en' ? level.labelEn : level.label,
  }));

  return (
    <>
      <MCFormWrapper
        schema={doctorLanguageSchema(t)}
        onSubmit={handleSubmit}
        className={`${isMobile ? "max-w-full" : "max-w-xl"} mx-auto ${
          isMobile ? "p-0" : "p-4"
        } flex flex-col gap-6`}
      >
        <div
          className={`border rounded-xl bg-accent/40 ${
            isMobile ? "p-3" : "p-4"
          } flex flex-col gap-1`}
        >
          <div
            className={`flex items-center gap-2 text-primary font-semibold ${
              isMobile ? "text-base" : "text-lg"
            }`}
          >
            <LanguagesIcon className={isMobile ? "text-base" : "text-xl"} />
            {t("languages.title")}
          </div>
          <div className={`text-primary ${isMobile ? "text-sm" : "text-base"}`}>
            {t("languages.description")}
          </div>
        </div>
        <div>
          <h2
            className={`${
              isMobile ? "text-xl" : "text-2xl"
            } font-semibold text-primary mb-2`}
          >
            {t("languages.list")}
          </h2>
          <div
            className={`border-2 border-dotted border-primary rounded-xl ${
              isMobile ? "p-3" : "p-4"
            } mb-2 min-h-[60px]`}
          >
            {isLoadingLanguages ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div
                className={`flex flex-wrap ${isMobile ? "gap-1.5" : "gap-2"} mb-3`}
              >
                {doctorLanguages.map((language) => {
                  // Buscar el idioma en la lista para obtener la traducción
                  const languageInfo = AVAILABLE_LANGUAGES.find(
                    l => l.label === language.nombre
                  );
                  const languageLabel = i18n.language === 'en' 
                    ? (languageInfo?.labelEn || language.nombre)
                    : language.nombre;
                  const proficiencyName = language.nivel;

                  return (
                    <span
                      key={language.id}
                      className={`flex items-center gap-2 ${
                        isMobile ? "px-3 py-0.5" : "px-4 py-1"
                      } bg-accent/40 text-primary rounded-full ${
                        isMobile ? "text-sm" : "text-base"
                      } font-medium`}
                    >
                      <span className="flex items-center gap-1">
                        <LanguagesIcon
                          className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mb-0.5`}
                        />
                        {languageLabel}
                        {proficiencyName && (
                          <span className="text-xs opacity-70">({proficiencyName})</span>
                        )}
                      </span>
                      <MCButton
                        size="s"
                        onClick={() => handleOpenEditDialog(language)}
                        className="ml-1 rounded-full p-0.5 bg-transparent hover:bg-accent/70"
                        aria-label={t("languages.edit")}
                        disabled={isSubmitting}
                      >
                        <Edit2 size={isMobile ? 14 : 16} className="text-primary" />
                      </MCButton>
                      <MCButton
                        size="s"
                        onClick={() => handleRemoveLanguage(language.id)}
                        className="ml-1 rounded-full p-0.5 bg-transparent hover:bg-accent/70"
                        aria-label={t("languages.remove")}
                        disabled={isSubmitting}
                      >
                        <X size={isMobile ? 16 : 18} className="text-primary" />
                      </MCButton>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Seleccionar idioma */}
          <div
            className={`mb-1 ${
              isMobile ? "text-base" : "text-lg"
            } font-medium text-primary`}
          >
            {t("languages.add")}
          </div>
          <MCSelect
            key={`language-${doctorLanguages.length}`}
            name="language"
            className="mb-4"
            searchable={true}
            placeholder={t("languages.select", "Selecciona un idioma")}
            options={availableLanguages}
            onChange={(value) => {
              if (typeof value === "string") {
                setSelectedLanguage(value);
              }
            }}
            disabled={isLoadingLanguages || isSubmitting || availableLanguages.length === 0}
          />

          {/* Seleccionar nivel de dominio */}
          <div
            className={`mb-1 ${
              isMobile ? "text-base" : "text-lg"
            } font-medium text-primary`}
          >
            {t("languages.proficiency")}
          </div>
          <MCSelect
            key={`proficiency-${doctorLanguages.length}`}
            name="proficiency"
            className="mb-4"
            placeholder={t("languages.selectProficiency", "Selecciona el nivel")}
            options={proficiencyOptions}
            onChange={(value) => {
              if (typeof value === "string") {
                setSelectedProficiency(value);
              }
            }}
            disabled={isLoadingLanguages || isSubmitting}
          />

          {/* Botón para agregar */}
          <MCButton
            onClick={handleAddLanguage}
            disabled={!selectedLanguage || !selectedProficiency || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("common.adding", "Agregando...")}
              </>
            ) : (
              t("languages.add")
            )}
          </MCButton>
        </div>
      </MCFormWrapper>

      {/* Diálogo para editar nivel de dominio */}
      <MCDialogBase
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingLanguage(null);
            setEditProficiency(null);
          }
        }}
        title={t("languages.edit", "Editar nivel de dominio")}
        description={
          editingLanguage
            ? (() => {
                const languageInfo = AVAILABLE_LANGUAGES.find(
                  l => l.label === editingLanguage.nombre
                );
                return i18n.language === 'en' 
                  ? (languageInfo?.labelEn || editingLanguage.nombre)
                  : editingLanguage.nombre;
              })()
            : ""
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t("languages.proficiency")}
            </label>
            <Select
              value={editProficiency || undefined}
              onValueChange={(value) => setEditProficiency(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("languages.selectProficiency")} />
              </SelectTrigger>
              <SelectContent>
                {proficiencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <MCButton
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingLanguage(null);
                setEditProficiency(null);
              }}
              disabled={isUpdating}
            >
              {t("common.cancel", "Cancelar")}
            </MCButton>
            <MCButton
              onClick={handleUpdateProficiency}
              disabled={!editProficiency || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.saving", "Guardando...")}
                </>
              ) : (
                t("common.save", "Guardar")
              )}
            </MCButton>
          </div>
        </div>
      </MCDialogBase>
    </>
  );
}

export default LanguagesTab;
