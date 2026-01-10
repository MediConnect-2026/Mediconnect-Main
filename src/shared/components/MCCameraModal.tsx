import { useRef, useEffect, useState } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/shared/ui/morphing-dialog";
import { useAppStore } from "@/stores/useAppStore";

type MCCameraModalProps = {
  children?: React.ReactNode;
  onCapture: (imageDataUrl: string) => void;
  triggerClassName?: string;
};

export function MCCameraModal({
  children,
  onCapture,
  triggerClassName,
}: MCCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isMobile = useIsMobile();

  const isLoading = useAppStore((state) => state.isloading);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive]);

  const handleCapture = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        stopCamera();
        setIsCameraActive(false);
        onCapture(imageDataUrl);
      }
    }
  };

  const handleCancel = () => {
    stopCamera();
    setIsCameraActive(false);
  };

  // Espaciado adaptativo para móvil
  const paddingClasses = isMobile ? "p-3" : "p-4";
  const headerPadding = isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-4 pb-3";
  const contentPadding = isMobile ? "px-4 py-2" : "px-6 py-2";
  const footerPadding = isMobile ? "px-4 pb-4 pt-3" : "px-6 pb-4 pt-3";

  const sizeClasses = isMobile
    ? "w-full max-w-[95vw] mx-2 max-h-[70vh]"
    : "max-w-md max-h-[60vh] w-full";

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 24,
      }}
    >
      {children && (
        <MorphingDialogTrigger className={triggerClassName}>
          <div onClick={() => setIsCameraActive(true)}>{children}</div>
        </MorphingDialogTrigger>
      )}

      <MorphingDialogContainer className={paddingClasses}>
        <MorphingDialogContent
          className={`bg-white rounded-3xl shadow-lg ${sizeClasses} flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`flex justify-between items-center ${headerPadding} flex-shrink-0`}
          >
            <MorphingDialogTitle>
              <h2
                className={`font-semibold text-primary ${
                  isMobile ? "text-lg" : "text-xl"
                }`}
              >
                Tomar foto
              </h2>
            </MorphingDialogTitle>
            <MorphingDialogClose
              typeclose="X"
              className="text-primary flex-shrink-0"
            />
          </div>

          {/* Content */}
          <MorphingDialogDescription
            className={`${contentPadding} flex-1 overflow-y-auto min-h-0`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                    <span className="text-red-500 text-center px-4">
                      {error}
                    </span>
                  </div>
                ) : null}

                {isLoading && !error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">Cargando cámara...</span>
                  </div>
                ) : null}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: isLoading || error ? "none" : "block" }}
                />
              </div>
            </div>
          </MorphingDialogDescription>

          {/* Footer */}
          <div
            className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
              isMobile ? "flex-col-reverse" : ""
            }`}
          >
            <MorphingDialogClose>
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={handleCancel}
                className={isMobile ? "w-full" : ""}
              >
                Cancelar
              </MCButton>
            </MorphingDialogClose>

            <MorphingDialogClose>
              <MCButton
                onClick={handleCapture}
                variant="primary"
                size={isMobile ? "l" : "m"}
                disabled={isLoading || !!error}
                className={isMobile ? "w-full" : ""}
              >
                Capturar foto
              </MCButton>
            </MorphingDialogClose>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export default MCCameraModal;
