import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';
import centerservices from '@/shared/navigation/userMenu/editProfile/center/services/center.services';
import type { CenterStats } from '@/types/CenterStatsTypes';

export const useCenterStatsResumen = (
  options?: Omit<UseQueryOptions<CenterStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CenterStats>({
    queryKey: QUERY_KEYS.CENTERS_STATS_RESUMEN,
    queryFn: centerservices.getCenterStatsGeneral,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    ...options,
  });
};

export default useCenterStatsResumen;
