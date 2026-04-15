import { useMutation } from "@tanstack/react-query";
import { mediaService, MediaValidationError } from "@/services/chat";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import type {
  UploadMediaResponse,
  AllowedMediaTypes,
} from "@/types/ChatTypes";

interface UploadMediaPayload {
  file: File | Blob;
  tipo: AllowedMediaTypes;
  conversacionId?: number;
  duration?: number; // Para audio
}

/**
 * Hook para subir archivos multimedia (imágenes, audio, video, archivos)
 * Maneja validación, upload y feedback de progreso
 * 
 * @returns Mutation result con función uploadMedia
 * 
 * @example
 * const { uploadMedia, isUploading } = useUploadMedia();
 * const result = await uploadMedia({ file, tipo: 'image', conversacionId: 123 });
 */
export const useUploadMedia = () => {
  const setToast = useGlobalUIStore((state) => state.setToast);

  const mutation = useMutation<UploadMediaResponse, Error, UploadMediaPayload>({
    mutationFn: async (payload: UploadMediaPayload) => {
      const { file, tipo } = payload;

      try {
        // Determinar método según tipo
        switch (tipo) {
          case "image":
            return await mediaService.uploadImage(
              file as File
            );

          case "audio":
            return await mediaService.uploadAudio(
              file as Blob
            );

          case "video":
            return await mediaService.uploadVideo(
              file as File
            );

          case "file":
            return await mediaService.uploadFile(
              file as File
            );

          default:
            throw new Error(`Tipo de media no soportado: ${tipo}`);
        }
      } catch (error) {
        if (error instanceof MediaValidationError) {
          throw error;
        }
        throw new Error("Error al subir archivo");
      }
    },

    onSuccess: (data: UploadMediaResponse) => {
      console.log("[useUploadMedia] Archivo subido exitosamente:", data);
      
      // Feedback opcional de éxito
      // setToast({
      //   message: "Archivo subido correctamente",
      //   type: "success",
      //   open: true,
      // });
    },

    onError: (error: Error) => {
      console.error("[useUploadMedia] Error:", error);
      
      let errorMessage = "Error al subir archivo";
      
      if (error instanceof MediaValidationError) {
        errorMessage = error.message;
      } else if (error.message.includes("Network")) {
        errorMessage = "Error de conexión. Verifica tu internet.";
      }

      setToast({
        message: errorMessage,
        type: "error",
        open: true,
      });
    },
  });

  return {
    uploadMedia: mutation.mutateAsync, // Async para usar con await
    isUploading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    progress: 0, // TODO: Implementar tracking de progreso con XHR
  };
};

export default useUploadMedia;
