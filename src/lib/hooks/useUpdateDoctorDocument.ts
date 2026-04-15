import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { doctorService } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service';
import type { 
  UpdateRejectedDocumentRequest,
  UpdateRejectedDocumentResponse 
} from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types';
import { QUERY_KEYS } from '@/lib/react-query/config';

interface UpdateDocumentVariables {
  documentId: number;
  data: UpdateRejectedDocumentRequest;
}

/**
 * Hook para actualizar un documento rechazado del doctor
 * 
 * Utiliza React Query mutation para:
 * - Manejo de estados de loading, error y success
 * - Invalidación automática del cache del perfil del doctor
 * - Callbacks opcionales para onSuccess y onError
 * 
 * @param options - Opciones de configuración del hook
 * @returns Mutation result con función mutate
 * 
 * @example
 * ```tsx
 * function DocumentCard() {
 *   const { mutate, isPending, error } = useUpdateDoctorDocument({
 *     onSuccess: () => {
 *       toast.success('Documento actualizado exitosamente');
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     }
 *   });
 * 
 *   const handleResubmit = (file: File) => {
 *     mutate({
 *       documentId: 123,
 *       data: {
 *         archivo: file,
 *         descripcion: 'Documento actualizado'
 *       }
 *     });
 *   };
 * }
 * ```
 */
export function useUpdateDoctorDocument(
  options?: {
    onSuccess?: (data: UpdateRejectedDocumentResponse) => void;
    onError?: (error: Error) => void;
  }
): UseMutationResult<
  UpdateRejectedDocumentResponse,
  Error,
  UpdateDocumentVariables,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateRejectedDocumentResponse,
    Error,
    UpdateDocumentVariables
  >({
    mutationFn: async ({ documentId, data }) => {
      return await doctorService.updateRejectedDocument(documentId, data);
    },
    onSuccess: (data) => {
      // Invalidar el cache del perfil del doctor para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.DOCTORS, 'me']
      });

      // Ejecutar callback personalizado si existe
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('❌ [useUpdateDoctorDocument] Error:', error);
      
      // Ejecutar callback personalizado si existe
      options?.onError?.(error);
    },
  });
}
