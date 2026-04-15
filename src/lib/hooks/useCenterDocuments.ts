import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';
import centerService from '@/shared/navigation/userMenu/editProfile/center/services/center.services';

export function useCenterDocuments(options?: { enabled?: boolean; staleTime?: number; refetchInterval?: number; language?: string; }) : UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: [...QUERY_KEYS.CENTERS, 'documents', 'my', options?.language || 'es'],
    queryFn: async () => {
      const target = options?.language || 'es';
      const source = target === 'es' ? 'en' : 'es';
      const translate_fields = 'nombreComercial,descripcion';

      const response = await centerService.getDocuments({ target, source, translate_fields });
      return response.data || response.data?.data || response;
    },
    staleTime: options?.staleTime || 1000 * 60 * 5,
    refetchInterval: options?.refetchInterval,
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}
