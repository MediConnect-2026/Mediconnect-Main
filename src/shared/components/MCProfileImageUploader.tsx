import "react-image-crop/dist/ReactCrop.css";
import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { ZoomIn, ZoomOut, Check, RotateCcw } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { Slider } from "@/shared/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/shared/ui/dialog";

export interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio: number;
  isCircular?: boolean;
  onCropComplete: (croppedImage: string) => void;
  title: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function MCProfileImageUploader({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  isCircular = false,
  onCropComplete,
  title,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  };

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Opcional: recorte circular
    if (isCircular) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (isCircular) ctx.restore();

    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(base64Image);
    onClose();
  }, [completedCrop, onCropComplete, onClose, isCircular]);

  const handleReset = () => {
    setScale(1);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="min-w-2xl max-w-3xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          {/* Crop Area */}
          <div className="space-y-6">
            <div
              className="relative rounded-4xl p-4 flex justify-center max-h-[400px] overflow-hidden border border-primary/5"
              ref={cropContainerRef}
              tabIndex={0} // Para permitir foco si quieres
            >
              <div className="rounded-4xl overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  circularCrop={isCircular}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{ transform: `scale(${scale})`, maxHeight: "400px" }}
                    className="max-w-full transition-transform origin-center"
                  />
                </ReactCrop>
              </div>
            </div>
            {/* Zoom Control */}
            <div className="flex items-center gap-4 px-2 w-[95%] mx-auto">
              <ZoomOut
                className="w-4 h-4 text-muted-foreground cursor-pointer"
                onClick={() => setScale((prev) => Math.max(prev - 0.05, 0.5))}
              />
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.5}
                max={2}
                step={0.05}
                className="flex-1"
              />
              <ZoomIn
                className="w-4 h-4 text-muted-foreground cursor-pointer"
                onClick={() => setScale((prev) => Math.min(prev + 0.05, 2))}
              />
              <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </div>
          {/* Actions */}
          <DialogFooter className="flex gap-3 pt-2 mt-10">
            <MCButton variant="secondary" size="m" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </MCButton>
            <MCButton variant="primary" size="m" onClick={getCroppedImg}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </MCButton>
            <DialogClose asChild>
              <MCButton variant="delete" size="m">
                Cancelar
              </MCButton>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
