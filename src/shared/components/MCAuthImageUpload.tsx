import { MCModalBase } from "@/shared/components/MCModalBase";
import MCButton from "@/shared/components/forms/MCButton";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import { useState, useEffect } from "react";
import { ImageUp, Camera, XIcon, FileText } from "lucide-react";
import MCCameraModal from "@/shared/components/MCCameraModal";
import { registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { useTranslation } from "react-i18next";

// Registrar plugins de FilePond
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type UploadedFile = { url: string; name?: string; type: string };
type MCImageUploadProps = {
  children?: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  modalId: string;
  cropTitle?: string;
  aspectRatio?: number;
  isCircular?: boolean;
  accept?: string;
  onFileUpload?: (fileUrl: string, fileType: string) => void;
  onFileRemove?: (index: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  uploadedFiles?: UploadedFile[];
};

export function MCImageUpload({
  children,
  title,
  description,
  imageSrc,
  modalId,
  cropTitle,
  aspectRatio = 1,
  isCircular = false,
  accept = "image/*,application/pdf",
  onFileUpload,
  onFileRemove,
  allowMultiple = false,
  maxFiles = 1,
  uploadedFiles: uploadedFilesProp,
  ...modalProps
}: MCImageUploadProps) {
  const { t } = useTranslation("auth");
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  useEffect(() => {
    if (uploadedFilesProp) {
      setUploadedFiles(uploadedFilesProp);
    }
  }, [uploadedFilesProp]);

  const handleCameraCapture = (imageDataUrl: string) => {
    setRawImage(imageDataUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = (cropped: string) => {
    const newFile = {
      url: cropped,
      name: `image_${Date.now()}.jpg`,
      type: "image",
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setCropModalOpen(false);
    setRawImage(null);
    onFileUpload?.(cropped, "image");
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    onFileRemove?.(index);
  };

  const handleFileUpload = () => {
    if (uploadedFiles.length >= maxFiles) {
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = allowMultiple && uploadedFiles.length < maxFiles - 1;
    input.onchange = (e) => {
      const selectedFiles = Array.from(
        (e.target as HTMLInputElement).files || []
      );

      const availableSlots = maxFiles - uploadedFiles.length;
      const filesToProcess = selectedFiles.slice(0, availableSlots);

      filesToProcess.forEach((file) => {
        if (file.type === "application/pdf") {
          const url = URL.createObjectURL(file);
          const newFile = { url, name: file.name, type: "pdf" };
          setUploadedFiles((prev) => {
            if (prev.length >= maxFiles) return prev;
            const updated = [...prev, newFile];
            onFileUpload?.(url, "pdf");
            return updated;
          });
        } else if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setRawImage(event.target?.result as string);
            setCropModalOpen(true);
          };
          reader.readAsDataURL(file);
        }
      });
    };
    input.click();
  };

  return (
    <>
      <MCModalBase
        id={modalId}
        {...modalProps}
        trigger={children}
        size="lg"
        typeclose="Arrow"
        triggerClassName="w-full"
      >
        <div className="h-full w-full p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-primary mb-2">
              {title}
            </h2>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src={imageSrc}
              alt={title}
              className="w-fit h-60 object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <p className="text-primary text-base max-w-md mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {uploadedFiles.length >= maxFiles && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                {t("imageUpload.limitReached", {
                  maxFiles,
                  plural: maxFiles > 1 ? "s" : "",
                })}
              </p>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                {t("imageUpload.uploadedFiles", {
                  count: uploadedFiles.length,
                })}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative border-2 border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    {file.type === "pdf" ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-10 h-10 text-secondary mb-2" />
                        <span className="text-xs text-gray-700 truncate w-full text-center">
                          {file.name}
                        </span>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary underline text-xs mt-1"
                        >
                          {t("imageUpload.viewPDF")}
                        </a>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="max-w-full max-h-32 rounded-lg"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                      aria-label={t("imageUpload.removeFile")}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 justify-center py-4">
            <MCButton
              onClick={handleFileUpload}
              variant="primary"
              icon={<ImageUp />}
              disabled={uploadedFiles.length >= maxFiles}
            >
              {t("imageUpload.uploadButton")}
            </MCButton>

            <MCCameraModal
              onCapture={handleCameraCapture}
              triggerClassName="w-full"
            >
              <MCButton
                variant="secondary"
                className="w-full"
                icon={<Camera />}
                disabled={uploadedFiles.length >= maxFiles}
              >
                {t("imageUpload.cameraButton")}
              </MCButton>
            </MCCameraModal>
          </div>
        </div>
      </MCModalBase>

      {rawImage && (
        <MCProfileImageUploader
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageSrc={rawImage}
          aspectRatio={aspectRatio}
          isCircular={isCircular}
          onCropComplete={handleCropComplete}
          title={cropTitle || t("imageUpload.cropTitle")}
        />
      )}
    </>
  );
}

export default MCImageUpload;
