import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import centerservices from '@/shared/navigation/userMenu/editProfile/center/services/center.services';
import type {
  CenterDoctorsGrowthPoint,
  CenterGrowthPeriod,
  CenterSpecialtyDistributionItem,
  CenterStats,
} from '@/types/CenterStatsTypes';

type DashboardDateRange = 'week' | 'month' | '3months' | 'year' | 'all';

const PERIOD_MAP: Record<DashboardDateRange, CenterGrowthPeriod> = {
  week: 'semana',
  month: 'mes',
  '3months': '3meses',
  year: 'año',
  all: 'todo',
};

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

export const useCenterSpecialtiesDistribution = (
  options?: Omit<UseQueryOptions<CenterSpecialtyDistributionItem[]>, 'queryKey' | 'queryFn'>
) => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const translationParams =
    language && language !== 'es'
      ? {
          target: language,
          source: 'es',
          translate_fields: 'nombre',
        }
      : undefined;

  return useQuery<CenterSpecialtyDistributionItem[]>({
    queryKey: QUERY_KEYS.CENTERS_STATS_DISTRIBUCION_ESPECIALIDADES(language),
    queryFn: async () => {
      const response = await centerservices.getCenterSpecialtiesDistribution(
        translationParams,
      );
      return response.especialidades ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    ...options,
  });
};

export const useCenterDoctorsGrowth = (
  dateRange: DashboardDateRange = 'month',
  options?: Omit<UseQueryOptions<CenterDoctorsGrowthPoint[]>, 'queryKey' | 'queryFn'>
) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const periodo = PERIOD_MAP[dateRange] ?? 'mes';

  const translationParams =
    language && language !== 'es'
      ? {
          periodo,
          target: language,
          source: 'es',
          translate_fields: 'label',
        }
      : {
          periodo,
        };

  return useQuery<CenterDoctorsGrowthPoint[]>({
    queryKey: QUERY_KEYS.CENTERS_STATS_CRECIMIENTO_MEDICOS(periodo, language),
    queryFn: async () => {
      const response = await centerservices.getCenterDoctorsGrowth(translationParams);
      return response.puntos ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    ...options,
  });
};

export default useCenterStatsResumen;
