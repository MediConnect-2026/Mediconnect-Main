import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';
import centerService from '@/shared/navigation/userMenu/editProfile/center/services/center.services';

export function useUpdateCenterDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, file, descripcion }: { 
      documentId: number; 
      file: File; 
      descripcion?: string 
    }) => centerService.updateDocument(documentId, { archivo: file, descripcion }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.CENTERS, 'documents', 'my'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.CENTERS, 'me'] });
    },
  });
}