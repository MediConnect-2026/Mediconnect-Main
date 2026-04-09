import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para gestionar el caché de seguros médicos
 * Proporciona funciones para invalidar y refrescar los datos cuando sea necesario
 * 
 * @example
 * const { invalidateInsurances, clearInsurancesCache } = useInsurancesCache();
 * 
 * // Invalidar y refetch
 * await invalidateInsurances();
 * 
 * // Limpiar cache completo
 * clearInsurancesCache();
 */
export const useInsurancesCache = () => {
  const queryClient = useQueryClient();

  /**
   * Invalida el cache de seguros disponibles y fuerza un refetch
   */
  const invalidateAvailableInsurances = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.AVAILABLE_INSURANCES(language)
        : ['insurances', 'available'],
    });
  };

  /**
   * Invalida el cache de seguros populares y fuerza un refetch
   */
  const invalidatePopularInsurances = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.POPULAR_INSURANCES(language)
        : ['insurances', 'popular'],
    });
  };

  /**
   * Invalida el cache de mis seguros y fuerza un refetch
   */
  const invalidateMyInsurances = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.MY_INSURANCES(language)
        : ['insurances', 'my'],
    });
  };

  /**
   * Invalida el cache de seguros aceptados (doctor) y fuerza un refetch
   */
  const invalidateAcceptedInsurances = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.ACCEPTED_INSURANCES(language)
        : ['insurances', 'accepted'],
    });
  };

  /**
   * Invalida el cache de tipos de seguros y fuerza un refetch
   */
  const invalidateInsuranceTypes = async (language?: string, insuranceId?: number) => {
    await queryClient.invalidateQueries({
      queryKey: insuranceId
        ? QUERY_KEYS.INSURANCE_TYPES_BY_INSURANCE(insuranceId, language)
        : ['insurances', 'types'],
    });
  };

  /**
   * Invalida todo el cache de seguros
   */
  const invalidateAllInsurances = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['insurances'],
    });
  };

  /**
   * Limpia completamente el cache de seguros disponibles
   */
  const clearAvailableInsurancesCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.AVAILABLE_INSURANCES(language)
        : ['insurances', 'available'],
    });
  };

  /**
   * Limpia completamente el cache de seguros populares
   */
  const clearPopularInsurancesCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.POPULAR_INSURANCES(language)
        : ['insurances', 'popular'],
    });
  };

  /**
   * Limpia completamente todo el cache de seguros
   */
  const clearAllInsurancesCache = () => {
    queryClient.removeQueries({
      queryKey: ['insurances'],
    });
  };

  /**
   * Precarga seguros disponibles para un idioma específico
   */
  const prefetchAvailableInsurances = async (language: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.AVAILABLE_INSURANCES(language),
      staleTime: 1000 * 60 * 30,
    });
  };

  /**
   * Precarga seguros populares para un idioma específico
   */
  const prefetchPopularInsurances = async (language: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.POPULAR_INSURANCES(language),
      staleTime: 1000 * 60 * 30,
    });
  };

  /**
   * Obtiene los datos del cache sin hacer request
   */
  const getCachedInsurances = (language: string) => {
    return queryClient.getQueryData(QUERY_KEYS.AVAILABLE_INSURANCES(language));
  };

  return {
    // Invalidación
    invalidateAvailableInsurances,
    invalidatePopularInsurances,
    invalidateMyInsurances,
    invalidateAcceptedInsurances,
    invalidateInsuranceTypes,
    invalidateAllInsurances,
    
    // Limpieza
    clearAvailableInsurancesCache,
    clearPopularInsurancesCache,
    clearAllInsurancesCache,
    
    // Precarga
    prefetchAvailableInsurances,
    prefetchPopularInsurances,
    
    // Obtención
    getCachedInsurances,
  };
};

export default useInsurancesCache;
