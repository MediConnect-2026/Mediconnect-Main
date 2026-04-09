import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para gestionar el caché de alergias y condiciones médicas
 * Proporciona funciones para invalidar y refrescar los datos cuando sea necesario
 * 
 * @example
 * const { invalidateAllergies, clearAllergiesCache } = useClinicalHistoryCache();
 * 
 * // Invalidar y refetch alergias
 * await invalidateAllergies();
 * 
 * // Limpiar cache completo de alergias
 * clearAllergiesCache();
 */
export const useClinicalHistoryCache = () => {
  const queryClient = useQueryClient();

  // ===== ALERGIAS =====

  /**
   * Invalida el cache de alergias disponibles y fuerza un refetch
   */
  const invalidateAvailableAllergies = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.AVAILABLE_ALLERGIES(language)
        : ['allergies', 'available'],
    });
  };

  /**
   * Invalida el cache de mis alergias y fuerza un refetch
   */
  const invalidateMyAllergies = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.MY_ALLERGIES(language)
        : ['allergies', 'my'],
    });
  };

  /**
   * Invalida todo el cache de alergias (disponibles y personales)
   */
  const invalidateAllAllergies = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['allergies'],
    });
  };

  /**
   * Limpia completamente el cache de alergias disponibles
   */
  const clearAvailableAllergiesCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.AVAILABLE_ALLERGIES(language)
        : ['allergies', 'available'],
    });
  };

  /**
   * Limpia completamente el cache de mis alergias
   */
  const clearMyAllergiesCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.MY_ALLERGIES(language)
        : ['allergies', 'my'],
    });
  };

  /**
   * Precarga alergias disponibles para un idioma específico
   */
  const prefetchAvailableAllergies = async (language: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.AVAILABLE_ALLERGIES(language),
      staleTime: 1000 * 60 * 30,
    });
  };

  // ===== CONDICIONES MÉDICAS =====

  /**
   * Invalida el cache de condiciones disponibles y fuerza un refetch
   */
  const invalidateAvailableConditions = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.AVAILABLE_CONDITIONS(language)
        : ['conditions', 'available'],
    });
  };

  /**
   * Invalida el cache de mis condiciones y fuerza un refetch
   */
  const invalidateMyConditions = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.MY_CONDITIONS(language)
        : ['conditions', 'my'],
    });
  };

  /**
   * Invalida todo el cache de condiciones (disponibles y personales)
   */
  const invalidateAllConditions = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['conditions'],
    });
  };

  /**
   * Limpia completamente el cache de condiciones disponibles
   */
  const clearAvailableConditionsCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.AVAILABLE_CONDITIONS(language)
        : ['conditions', 'available'],
    });
  };

  /**
   * Limpia completamente el cache de mis condiciones
   */
  const clearMyConditionsCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.MY_CONDITIONS(language)
        : ['conditions', 'my'],
    });
  };

  /**
   * Precarga condiciones disponibles para un idioma específico
   */
  const prefetchAvailableConditions = async (language: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.AVAILABLE_CONDITIONS(language),
      staleTime: 1000 * 60 * 30,
    });
  };

  // ===== UTILIDADES GENERALES =====

  /**
   * Invalida todo el cache de historial clínico (alergias y condiciones)
   */
  const invalidateAllClinicalHistory = async () => {
    await Promise.all([
      invalidateAllAllergies(),
      invalidateAllConditions(),
    ]);
  };

  /**
   * Limpia completamente todo el cache de historial clínico
   */
  const clearAllClinicalHistoryCache = () => {
    queryClient.removeQueries({
      queryKey: ['allergies'],
    });
    queryClient.removeQueries({
      queryKey: ['conditions'],
    });
  };

  return {
    // Alergias
    invalidateAvailableAllergies,
    invalidateMyAllergies,
    invalidateAllAllergies,
    clearAvailableAllergiesCache,
    clearMyAllergiesCache,
    prefetchAvailableAllergies,
    
    // Condiciones
    invalidateAvailableConditions,
    invalidateMyConditions,
    invalidateAllConditions,
    clearAvailableConditionsCache,
    clearMyConditionsCache,
    prefetchAvailableConditions,
    
    // Generales
    invalidateAllClinicalHistory,
    clearAllClinicalHistoryCache,
  };
};

export default useClinicalHistoryCache;
