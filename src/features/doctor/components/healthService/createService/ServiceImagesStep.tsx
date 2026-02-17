import { Plus, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const MIN_IMAGES = 1;
const MAX_IMAGES = 8;

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
}

function ServiceImagesStep() {
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

  useEffect(() => {
    if (storeImages && storeImages.length > 0) {
      setImages(
        storeImages.map((img: any) => ({
          id: img.id || crypto.randomUUID(),
          url: img.url,
          file: img.file,
        })),
      );
    }
  }, [storeImages]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const available = MAX_IMAGES - images.length;
    if (available <= 0) return;

    const newImages: UploadedImage[] = Array.from(files)
      .slice(0, available)
      .map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      }));

    setImages((prev) => {
      const updated = [...prev, ...newImages];
      setCreateServiceField(
        "images",
        updated.map((img) => ({
          id: img.id,
          url: img.url,
          file: img.file,
        })),
      );
      return updated;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.file) {
        URL.revokeObjectURL(img.url);
      }
      const updated = prev.filter((i) => i.id !== id);
      setCreateServiceField(
        "images",
        updated.map((img) => ({
          id: img.id,
          url: img.url,
          file: img.file,
        })),
      );
      return updated;
    });
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
            className={`flex ${isMobile ? "h-36 w-36" : "h-44 w-44"} items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 transition-colors hover:bg-muted`}
          >
            <Plus
              className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground/60`}
            />
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
              <button
                onClick={() => removeImage(img.id)}
                className={`absolute right-2 top-2 flex ${isMobile ? "h-5 w-5" : "h-6 w-6"} items-center justify-center rounded-full bg-foreground/60 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100`}
              >
                <X className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 transition-colors hover:bg-muted"
            >
              <Plus
                className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground/60`}
              />
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
      />

      <AuthFooterContainer
        continueButtonProps={{
          disabled: images.length < MIN_IMAGES,
          onClick: () => goToNextStep(),
        }}
        backButtonProps={{
          onClick: () => goToPreviousStep(),
        }}
      />
    </ServicesLayoutsSteps>
  );
}

export default ServiceImagesStep;
