import { Plus, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { urlToFile } from "@/features/onboarding/services/doctor-registration.mapper";

const MIN_IMAGES = 1;
const MAX_IMAGES = 8;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  type?: string;
  name?: string;
}

interface Props {
  isEditMode?: boolean;
  serviceId?: number;
}

function ServiceImagesStep({ isEditMode = false, serviceId }: Props) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const setCreateServiceField = useCreateServicesStore(
    (state) => state.setCreateServiceField,
  );
  const storeImages = useCreateServicesStore(
    (state) => state.createServiceData.images,
  );
  const goToNextStep = useCreateServicesStore((s) => s.goToNextStep);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setToast = useGlobalUIStore((s) => s.setToast);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (storeImages && storeImages.length > 0) {
      setImages((prev) =>
        storeImages.map((img: any) => {
          const existing = prev.find((p) => p.url === img.url);

          return {
            // Mantener id previo si el store no trae id para evitar NaN al eliminar
            id: String(img.id ?? existing?.id ?? crypto.randomUUID()),
            url: img.url,
            file: img.file,
            type: img.type,
            name: img.name,
          };
        }),
      );
    }
  }, [storeImages]);

  // Sincronizar el estado local `images` con el store solo cuando haya cambios
  useEffect(() => {
    const mapped = images.map((img) => ({
      id: img.id,
      url: img.url,
      type: img.file?.type || img.type || "image/jpeg",
      name: img.file?.name || img.name,
    }));
    try {
      const current = Array.isArray(storeImages) ? storeImages : [];
      if (JSON.stringify(current) !== JSON.stringify(mapped)) {
        setTimeout(() => setCreateServiceField("images", mapped), 0);
      }
    } catch (err) {
      setTimeout(() => setCreateServiceField("images", mapped), 0);
    }
  }, [images, storeImages, setCreateServiceField]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const available = MAX_IMAGES - images.length;
    if (available <= 0) return;
    const selectedFiles = Array.from(files).slice(0, available);

    // Validate file sizes in both create and edit modes
    const oversized = selectedFiles.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      setToast({
        message: t("createService.images.fileTooLarge", {
          defaultValue: "El archivo {{name}} excede el tamaño máximo de {{max}}MB",
          name: names,
          max: 5,
        }),
        type: "error",
        open: true,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // If in edit mode and we have a serviceId, upload immediately
    if (isEditMode && serviceId) {
      setIsUploading(true);
      try {
        // Convert selected File objects to normalized File via urlToFile
        const blobUrls = selectedFiles.map((f) => URL.createObjectURL(f));
        const filesToUpload: File[] = await Promise.all(
          selectedFiles.map(async (file, idx) => {
            try {
              const converted = await urlToFile(blobUrls[idx], file.name || `image-${idx + 1}`, file.type || undefined);
              return converted;
            } finally {
              URL.revokeObjectURL(blobUrls[idx]);
            }
          }),
        );

        const response = await doctorService.addImageToService(serviceId, filesToUpload as (File | Blob)[]);
        
        // response.data is an array of uploaded images
        const uploaded: UploadedImage[] = response.data.map((img: any) => ({
          id: String(img.id),
          url: img.url,
        }));

        setImages((prev) => [...prev, ...uploaded]);
        setToast({ 
          message: t("createService.images.addSuccess", "Imágenes agregadas correctamente"), 
          type: "success", 
          open: true 
        });
      } catch (err: any) {
        console.error("Error uploading images:", err);
        setToast({ 
          message: err?.message || t("createService.images.addError", "Error al agregar imágenes"), 
          type: "error", 
          open: true 
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return;
    }

    // Create mode: just add to local state
    const newImages: UploadedImage[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      type: file.type,
      name: file.name,
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = async (id: string) => {
    const img = images.find((i) => String(i.id) === String(id));
    if (!img) return;

    // If image has a file -> it's local/new, just revoke and remove
    if (img.file) {
      URL.revokeObjectURL(img.url);
      setImages((prev) => prev.filter((i) => String(i.id) !== String(id)));
      return;
    }

    // If in edit mode and serviceId present, call API to remove
    if (isEditMode && serviceId) {
      setDeletingImageId(id);
      try {
        const fallbackStoreImage = Array.isArray(storeImages)
          ? (storeImages as any[]).find((storedImg) => storedImg?.url === img.url)
          : undefined;

        const resolvedId = fallbackStoreImage?.id ?? img.id;
        const numericId = Number(resolvedId);
        if (!Number.isFinite(numericId) || numericId <= 0) {
          throw new Error(t("createService.images.removeInvalidId", "ID de imagen inválido para eliminar"));
        }
        await doctorService.removeImageFromService(serviceId, numericId);
        
        // Remove from local state after successful API call
        setImages((prev) => prev.filter((i) => String(i.id) !== String(id)));
        
        setToast({ 
          message: t("createService.images.removeSuccess", "Imagen eliminada"), 
          type: "success", 
          open: true 
        });
      } catch (err: any) {
        console.error("Error removing image:", err);
        setToast({ 
          message: err?.message || t("createService.images.removeError", "Error al eliminar imagen"), 
          type: "error", 
          open: true 
        });
      } finally {
        setDeletingImageId(null);
      }
    } else {
      // Not in edit mode, just remove locally
      setImages((prev) => prev.filter((i) => String(i.id) !== String(id)));
    }
  };

  const remaining = Math.max(0, MIN_IMAGES - images.length);

  return (
    <ServicesLayoutsSteps
      title={t("createService.images.title")}
      description={t("createService.images.description")}
    >
      {images.length > 0 && (
        <p
          className={`mt-6 ${isMobile ? "text-xs" : "text-sm"} text-muted-foreground text-center`}
        >
          {remaining > 0
            ? `${remaining} ${t("createService.images.minImages")} ${MIN_IMAGES} ${t("createService.images.minImagesText")}`
            : `${images.length} ${t("createService.images.addedImages")} ${MAX_IMAGES} ${t("createService.images.addedImagesText")}`}
        </p>
      )}

      {images.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex ${isMobile ? "h-36 w-36" : "h-44 w-44"} items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <Plus
                className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground/60`}
              />
            )}
          </button>
        </div>
      ) : (
        <div
          className={`mt-4 grid ${isMobile ? "grid-cols-2" : "grid-cols-3"} gap-3 content-start`}
        >
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg"
            >
              <img
                src={img.url}
                alt={`${t("createService.images.imageAlt")} ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {deletingImageId === img.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              <button
                onClick={() => removeImage(img.id)}
                disabled={deletingImageId === img.id}
                className={`absolute right-2 top-2 flex ${isMobile ? "h-5 w-5" : "h-6 w-6"} items-center justify-center rounded-full bg-foreground/60 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <X className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <Plus
                  className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground/60`}
                />
              )}
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <AuthFooterContainer
        continueButtonProps={{
          disabled: images.length < MIN_IMAGES || isUploading || deletingImageId !== null,
          onClick: () => goToNextStep(),
        }}
        backButtonProps={{
          onClick: () => goToPreviousStep(),
          disabled: isUploading || deletingImageId !== null,
        }}
      />
    </ServicesLayoutsSteps>
  );
}

export default ServiceImagesStep;