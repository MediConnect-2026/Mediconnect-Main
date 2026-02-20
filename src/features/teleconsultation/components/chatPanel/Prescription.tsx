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
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface PrescriptionProps {
  minHeight?: string;
  maxHeight?: string;
}

function Prescription({ minHeight, maxHeight }: PrescriptionProps) {
  const { t } = useTranslation("common");
  const addPrescription = usePrescriptionStore(
    (state) => state.addPrescription,
  );
  const prescription = usePrescriptionStore((state) => state.prescription);
  const isMobile = useIsMobile();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILES = 5;

  const handleFilesAdd = (
    newFiles: File[],
    onChange: (files: File[]) => void,
  ) => {
    let updatedFiles = [...files, ...newFiles];
    if (updatedFiles.length > MAX_FILES) {
      updatedFiles = updatedFiles.slice(0, MAX_FILES);
    }
    setFiles(updatedFiles);
    onChange(updatedFiles);

    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => {
      const combined = [...prev, ...newUrls];
      return combined.slice(0, MAX_FILES);
    });
  };

  const handleRemoveFile = (
    index: number,
    onChange: (files: File[]) => void,
  ) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    URL.revokeObjectURL(previews[index]);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onChange(updatedFiles);
  };

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
    <div className="flex flex-col h-full w-full rounded-xl md:rounded-2xl overflow-hidden overflow-y-auto">
      <MCFormWrapper schema={prescriptionSchema(t)} onSubmit={addPrescription}>
        <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4 overflow-y-auto h-full w-full items-center">
          <div className="flex flex-col gap-3 md:gap-4 flex-1 overflow-y-auto w-full max-w-3xl px-1">
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
                  placeholder={t(
                    "prescription.diagnosisDescriptionPlaceholder",
                  )}
                  error={fieldState.error?.message}
                  minHeight={minHeight}
                  maxHeight={maxHeight}
                />
              )}
            />

            {/* Document Upload Area */}
            <Controller
              name="documents"
              defaultValue={[]}
              render={({ field }) => (
                <div>
                  <label className="block text-sm md:text-base lg:text-lg text-primary mb-2 font-medium">
                    {t("prescription.documents")}
                  </label>

                  {/* Drop Zone */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, field.onChange)}
                    className={`
                      relative border-2 border-dashed rounded-lg p-3 md:p-4 text-center
                      transition-all duration-200 cursor-pointer
                      ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-primary/15 hover:border-primary/50 bg-bg-btn-secondary"
                      }
                    `}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        handleFilesAdd(selectedFiles, field.onChange);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={files.length >= MAX_FILES}
                    />

                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                      <p className="text-xs md:text-sm font-medium text-primary">
                        {isMobile ? "Toca para subir" : "Arrastra o haz clic"}
                      </p>
                      <p className="text-[10px] md:text-xs text-primary/75">
                        Imágenes y documentos
                      </p>
                      {files.length >= MAX_FILES && (
                        <span className="text-xs text-red-500 mt-1">
                          Máximo {MAX_FILES} archivos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Previews */}
                  {previews.length > 0 && (
                    <div className="mt-3 md:mt-4">
                      <p className="text-xs md:text-sm text-primary mb-2 md:mb-3">
                        {previews.length} archivo
                        {previews.length !== 1 ? "s" : ""} subido
                        {previews.length !== 1 ? "s" : ""}
                      </p>
                      <div className="border bg-primary/15 rounded-lg p-2 md:p-3 bg-bg-secondary">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                          {previews.map((url, idx) => {
                            const file = files[idx];
                            const isImage = file?.type.startsWith("image/");
                            return (
                              <div
                                key={idx}
                                className="relative group aspect-square border-2 border-primary/15 rounded-lg overflow-hidden bg-bg-btn-secondary hover:border-primary transition-colors"
                              >
                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFile(idx, field.onChange)
                                  }
                                  className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  aria-label="Eliminar archivo"
                                >
                                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                </button>

                                {/* File Preview */}
                                <div className="w-full h-full flex items-center justify-center p-1">
                                  {isImage ? (
                                    <img
                                      src={url}
                                      alt={`Preview ${idx + 1}`}
                                      className="object-cover w-full h-full rounded-lg"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1 w-full h-full justify-center">
                                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            />

            <MCButton type="submit" size="l" className="w-full md:w-auto">
              {t("prescription.submit")}
            </MCButton>
          </div>
        </div>
      </MCFormWrapper>
    </div>
  );
}

export default Prescription;
