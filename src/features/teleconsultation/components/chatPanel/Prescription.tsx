import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { usePrescriptionStore } from "@/stores/usePrescriptionStore";
import { prescriptionSchema } from "@/schema/prescription.schema";
import { useTranslation } from "react-i18next";
import MCInput from "@/shared/components/forms/MCInput";
import RichTextEditor from "./RichTextEditor";
import { Controller } from "react-hook-form";
import { useState } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import { Upload, X, FileText } from "lucide-react";

function Prescription() {
  const { t } = useTranslation();
  const addPrescription = usePrescriptionStore(
    (state) => state.addPrescription,
  );
  const prescription = usePrescriptionStore((state) => state.prescription);

  // Estado local para archivos y previews
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Maneja la subida de archivos
  const handleFilesAdd = (
    newFiles: File[],
    onChange: (files: File[]) => void,
  ) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles);

    // Genera URLs para previsualización
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newUrls]);
  };

  // Elimina un archivo específico
  const handleRemoveFile = (
    index: number,
    onChange: (files: File[]) => void,
  ) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    // Libera la URL del objeto
    URL.revokeObjectURL(previews[index]);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onChange(updatedFiles);
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (
    e: React.DragEvent,
    onChange: (files: File[]) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesAdd(droppedFiles, onChange);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MCFormWrapper schema={prescriptionSchema(t)} onSubmit={addPrescription}>
        <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
          <MCInput
            name="diagnosisTittle"
            label={t("prescription.diagnosisTittle")}
            placeholder={t("prescription.diagnosisTittlePlaceholder")}
            size="medium"
          />

          <Controller
            name="diagnosisDescription"
            defaultValue={prescription?.diagnosisDescription || ""}
            render={({ field, fieldState }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                label={t("prescription.diagnosisDescription")}
                placeholder={t("prescription.diagnosisDescriptionPlaceholder")}
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Área de subida de documentos mejorada */}
          <Controller
            name="documents"
            defaultValue={[]}
            render={({ field }) => (
              <div>
                <label className="block text-base sm:text-lg text-primary mb-2 font-medium">
                  {t("prescription.documents")}
                </label>

                {/* Zona de Drop */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, field.onChange)}
                  className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center
                  transition-all duration-200 cursor-pointer
                  ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary/50 bg-gray-50"
                  }
                `}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      handleFilesAdd(selectedFiles, field.onChange);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Arrastra y suelta archivos aquí
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        o haz clic para seleccionar
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Imágenes y PDFs permitidos
                    </p>
                  </div>
                </div>

                {/* Vista previa de archivos con scroll interno */}
                {previews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      {previews.length} archivo
                      {previews.length !== 1 ? "s" : ""} subido
                      {previews.length !== 1 ? "s" : ""}
                    </p>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {/* Aumenta la altura máxima si es necesario */}
                      <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[260px]">
                        {previews.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative group w-20 h-20 flex-shrink-0 border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:border-primary transition-colors"
                          >
                            {/* Botón eliminar */}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFile(idx, field.onChange)
                              }
                              className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              aria-label="Eliminar archivo"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {/* Preview del archivo */}
                            <div className="w-full h-full flex items-center justify-center p-1">
                              {files[idx]?.type === "application/pdf" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <FileText className="w-6 h-6 text-red-500" />
                                  <span className="text-[10px] text-gray-600 text-center truncate w-full px-1">
                                    {files[idx]?.name}
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={url}
                                  alt={`Preview ${idx + 1}`}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          />

          <MCButton type="submit" size="ml">
            {t("prescription.submit")}
          </MCButton>
        </div>
      </MCFormWrapper>
    </div>
  );
}

export default Prescription;
