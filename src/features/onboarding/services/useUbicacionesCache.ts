import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para gestionar el cache de ubicaciones geográficas
 * Proporciona funciones para invalidar y refrescar los datos por nivel (provincia, municipio, distrito, etc.)
 *
 * ESTRUCTURA DE BÚSQUEDA:
 * - provincias: búsqueda inicial
 * - municipios: requiere idProvincia
 * - distritos: requiere idMunicipio
 * - secciones: requiere idDistrito
 * - barrios: requiere idSeccion
 * - subbarrios: requiere idBarrio
 *
 * @example
 * const { invalidateUbicaciones, clearCache } = useUbicacionesCache();
 * await invalidateUbicaciones('municipios', { idProvincia: 1 });
 * clearCache('barrios');
 */
export const useUbicacionesCache = () => {
  const queryClient = useQueryClient();

  /**
   * Invalida el cache de un nivel de ubicación y fuerza un refetch
   * @param nivel - provincia | municipio | distrito | seccion | barrio | subbarrio
   * @param params - parámetros para la key (ej: { idProvincia })
   */
  const invalidateUbicaciones = async (
    nivel: 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios',
    params?: Record<string, any>
  ) => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
    });

    // Limpiar localStorage
    const cacheKey = `ubicaciones_${nivel}${params ? '_' + Object.values(params).join('_') : ''}`;
    localStorage.removeItem(cacheKey);
  };

  /**
   * Refresca los datos sin invalidar (background refetch)
   */
  const refetchUbicaciones = async (
    nivel: 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios',
    params?: Record<string, any>
  ) => {
    await queryClient.refetchQueries({
      queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
    });
  };

  /**
   * Limpia completamente el cache (memoria + localStorage) de un nivel
   */
  const clearCache = (
    nivel: 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios',
    params?: Record<string, any>
  ) => {
    queryClient.removeQueries({
      queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
    });
    const cacheKey = `ubicaciones_${nivel}${params ? '_' + Object.values(params).join('_') : ''}`;
    localStorage.removeItem(cacheKey);
  };

  /**
   * Precarga ubicaciones para un nivel específico
   */
  const prefetchUbicaciones = async (
    nivel: 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios',
    params?: Record<string, any>
  ) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
      staleTime: 1000 * 60 * 30,
    });
  };

  /**
   * Obtiene los datos del cache sin hacer request
   */
  const getCachedUbicaciones = (
    nivel: 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios',
    params?: Record<string, any>
  ) => {
    return queryClient.getQueryData(QUERY_KEYS.UBICACIONES(nivel, params));
  };

  return {
    invalidateUbicaciones,
    refetchUbicaciones,
    clearCache,
    prefetchUbicaciones,
    getCachedUbicaciones,
  };
};

export default useUbicacionesCache;
