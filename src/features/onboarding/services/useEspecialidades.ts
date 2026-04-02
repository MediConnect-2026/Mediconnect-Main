import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import { QUERY_KEYS } from '@/lib/react-query/config';
import especialidadesService from './especialidades.service';
import type { SelectOption, EspecialidadesParams } from './especialidades.types';

/**
 * Hook personalizado para obtener especialidades médicas
 * Incluye soporte automático para traducción basada en el idioma actual
 * 
 * OPTIMIZACIONES IMPLEMENTADAS:
 * - Cache en memoria: 24 horas
 * - Cache persistente: localStorage (7 días)
 * - staleTime: 30 minutos (no refetch innecesarios)
 * - No refetch automático en windowFocus o reconnect
 * - Placeholder data para UX fluida durante updates
 * 
 * ESTRATEGIA DE CACHE:
 * 1. Primera carga: Intenta cargar desde localStorage
 * 2. Si no existe o está expirado: Hace request a la API
 * 3. Guarda en localStorage automáticamente
 * 4. Mantiene datos en memoria por 24 horas
 * 
 * INVALIDACIÓN:
 * Use `useEspecialidadesCache()` para invalidar manualmente cuando sea necesario
 * 
 * @param params - Parámetros opcionales para filtrar especialidades
 * @param options - Opciones de configuración
 * @param options.enabled - Si la query debe ejecutarse automáticamente (default: true)
 * @param options.refetchOnMount - Si debe refetch al montar el componente (default: false)
 * @returns Query con las especialidades formateadas para MCSelect
 * 
 * @example
 * // Uso básico - carga desde cache si existe, sino hace request
 * const { data: especialidades, isLoading } = useEspecialidades();
 * 
 * @example
 * // Forzar refetch al montar (útil después de agregar una especialidad)
 * const { data: especialidades } = useEspecialidades({}, { refetchOnMount: true });
 * 
 * @example
 * // Con gestión de cache manual
 * const { data: especialidades } = useEspecialidades();
 * const { invalidateEspecialidades } = useEspecialidadesCache();
 * 
 * // Invalidar y refrescar cuando sea necesario
 * const handleRefresh = () => invalidateEspecialidades();
 */
export const useEspecialidades = (
  params?: Partial<EspecialidadesParams>,
  options?: { enabled?: boolean; refetchOnMount?: boolean }
) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toLowerCase().startsWith('en')
    ? 'en'
    : 'es';
  const queryClient = useQueryClient();
  const queryParams = useMemo<Record<string, unknown> | undefined>(() => {
    if (!params) return undefined;
    return Object.fromEntries(Object.entries(params));
  }, [params]);

  const query = useQuery<SelectOption[], Error>({
    queryKey: QUERY_KEYS.ESPECIALIDADES(currentLanguage, queryParams),
    queryFn: () => especialidadesService.getAllActiveEspecialidades(currentLanguage),
    
    // Optimizaciones para datos relativamente estáticos:
    staleTime: 1000 * 60 * 30, // 30 minutos - las especialidades cambian raramente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas en memoria - mantener cache por más tiempo
    
    // Estrategia de refetch
    refetchOnWindowFocus: false, // No refetch al volver a la ventana (datos estáticos)
    refetchOnReconnect: false, // No refetch al reconectar
    refetchOnMount: options?.refetchOnMount ?? false, // Solo refetch si se especifica
    
    enabled: options?.enabled ?? true,
    
    // Usar data en cache mientras se actualiza en background
    placeholderData: (previousData) => previousData,
  });

  // Persistir en localStorage cuando los datos cambien
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      try {
        const cacheKey = `especialidades_${currentLanguage}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          data: query.data,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.warn('Error saving especialidades to localStorage:', error);
      }
    }
  }, [query.data, currentLanguage]);

  // Cargar desde localStorage si no hay data en cache
  useEffect(() => {
    if (!query.data) {
      try {
        const cacheKey = `especialidades_${currentLanguage}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Usar cache solo si tiene menos de 7 días
          const isValid = Date.now() - timestamp < 1000 * 60 * 60 * 24 * 7;
          if (isValid && data) {
            queryClient.setQueryData(
              QUERY_KEYS.ESPECIALIDADES(currentLanguage, queryParams),
              data
            );
          }
        }
      } catch (error) {
        console.warn('Error loading especialidades from localStorage:', error);
      }
    }
  }, [currentLanguage, queryParams, queryClient, query.data]);

  return query;
};

/**
 * Hook para obtener especialidades con parámetros personalizados
 * Útil cuando necesitas más control sobre la query
 * 
 * @param params - Parámetros completos para la API
 * @param enabled - Si la query debe ejecutarse automáticamente
 * 
 * @example
 * const { data, isLoading } = useEspecialidadesCustom({
 *   target: 'en',
 *   translate_fields: 'nombre,descripcion',
 *   estado: 'Activo'
 * });
 */
export const useEspecialidadesCustom = (
  params?: EspecialidadesParams,
  enabled: boolean = true
) => {
  const customQueryParams = useMemo<Record<string, unknown> | undefined>(() => {
    if (!params) return undefined;
    return Object.fromEntries(Object.entries(params));
  }, [params]);

  return useQuery<SelectOption[], Error>({
    queryKey: QUERY_KEYS.ESPECIALIDADES_CUSTOM(customQueryParams),
    queryFn: () => especialidadesService.getEspecialidadesForSelect(params),
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export default useEspecialidades;
