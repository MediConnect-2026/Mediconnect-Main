import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para gestionar el cache de especialidades médicas
 * Proporciona funciones para invalidar y refrescar los datos cuando sea necesario
 * 
 * @example
 * const { invalidateEspecialidades, clearCache } = useEspecialidadesCache();
 * 
 * // Invalidar y refetch
 * await invalidateEspecialidades();
 * 
 * // Limpiar cache completo (localStorage + memory)
 * clearCache();
 */
export const useEspecialidadesCache = () => {
  const queryClient = useQueryClient();

  /**
   * Invalida el cache de especialidades y fuerza un refetch
   * Útil cuando se sabe que los datos han cambiado en el servidor
   */
  const invalidateEspecialidades = async (language?: string) => {
    // Invalidar queries de React Query
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.ESPECIALIDADES(language)
        : ['especialidades'],
    });

    // Limpiar localStorage
    if (language) {
      localStorage.removeItem(`especialidades_${language}`);
    } else {
      // Limpiar todos los idiomas
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('especialidades_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Refresca los datos sin invalidar (background refetch)
   * Útil para actualizar datos sin afectar el UI
   */
  const refetchEspecialidades = async (language?: string) => {
    await queryClient.refetchQueries({
      queryKey: language 
        ? QUERY_KEYS.ESPECIALIDADES(language)
        : ['especialidades'],
    });
  };

  /**
   * Limpia completamente el cache (memoria + localStorage)
   * Útil para troubleshooting o después de cambios importantes
   */
  const clearCache = (language?: string) => {
    // Remover de React Query
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.ESPECIALIDADES(language)
        : ['especialidades'],
    });

    // Remover de localStorage
    if (language) {
      localStorage.removeItem(`especialidades_${language}`);
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('especialidades_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Precarga especialidades para un idioma específico
   * Útil para mejorar la experiencia al cambiar de idioma
   */
  const prefetchEspecialidades = async (language: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.ESPECIALIDADES(language),
      staleTime: 1000 * 60 * 30,
    });
  };

  /**
   * Obtiene los datos del cache sin hacer request
   * Retorna undefined si no hay datos en cache
   */
  const getCachedEspecialidades = (language: string) => {
    return queryClient.getQueryData(QUERY_KEYS.ESPECIALIDADES(language));
  };

  return {
    invalidateEspecialidades,
    refetchEspecialidades,
    clearCache,
    prefetchEspecialidades,
    getCachedEspecialidades,
  };
};

export default useEspecialidadesCache;
