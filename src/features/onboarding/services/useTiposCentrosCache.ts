import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para gestionar el cache de tipos de centros de salud
 * Proporciona funciones para invalidar y refrescar los datos cuando sea necesario
 * 
 * @example
 * const { invalidateTiposCentros, clearCache } = useTiposCentrosCache();
 * 
 * // Invalidar y refetch
 * await invalidateTiposCentros();
 * 
 * // Limpiar cache completo (localStorage + memory)
 * clearCache();
 */
export const useTiposCentrosCache = () => {
  const queryClient = useQueryClient();

  /**
   * Invalida el cache de tipos de centros y fuerza un refetch
   * Útil cuando se sabe que los datos han cambiado en el servidor
   */
  const invalidateTiposCentros = async (language?: string) => {
    await queryClient.invalidateQueries({
      queryKey: language 
        ? QUERY_KEYS.TIPOS_CENTROS(language)
        : ['tiposCentros'],
    });

    if (language) {
      localStorage.removeItem(`tiposCentros_${language}`);
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('tiposCentros_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Refresca los datos sin invalidar (background refetch)
   */
  const refetchTiposCentros = async (language?: string) => {
    await queryClient.refetchQueries({
      queryKey: language 
        ? QUERY_KEYS.TIPOS_CENTROS(language)
        : ['tiposCentros'],
    });
  };

  /**
   * Limpia completamente el cache (memoria + localStorage)
   */
  const clearCache = (language?: string) => {
    queryClient.removeQueries({
      queryKey: language 
        ? QUERY_KEYS.TIPOS_CENTROS(language)
        : ['tiposCentros'],
    });

    if (language) {
      localStorage.removeItem(`tiposCentros_${language}`);
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('tiposCentros_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Precarga tipos de centros para un idioma específico
   */
  const prefetchTiposCentros = async (language: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.TIPOS_CENTROS(language),
      staleTime: 1000 * 60 * 30,
    });
  };

  /**
   * Obtiene los datos del cache sin hacer request
   */
  const getCachedTiposCentros = (language: string) => {
    return queryClient.getQueryData(QUERY_KEYS.TIPOS_CENTROS(language));
  };

  return {
    invalidateTiposCentros,
    refetchTiposCentros,
    clearCache,
    prefetchTiposCentros,
    getCachedTiposCentros,
  };
};

export default useTiposCentrosCache;
