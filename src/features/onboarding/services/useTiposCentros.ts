import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { QUERY_KEYS } from "@/lib/react-query/config";
import tiposCentrosService from "./tipo-centro.service";
import type { SelectOption, TipoCentroParams } from "./tipos-centro.types";

/**
 * Hook personalizado para obtener tipos de centros de salud
 * Incluye soporte automático para traducción basada en el idioma actual
 *
 * OPTIMIZACIONES IMPLEMENTADAS:
 * - Cache en memoria: 24 horas
 * - Cache persistente: localStorage (7 días)
 * - staleTime: 30 minutos
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
 * Use `useTiposCentrosCache()` para invalidar manualmente cuando sea necesario
 *
 * @param params - Parámetros opcionales para filtrar tipos de centros
 * @param options - Opciones de configuración
 * @param options.enabled - Si la query debe ejecutarse automáticamente (default: true)
 * @param options.refetchOnMount - Si debe refetch al montar el componente (default: false)
 * @returns Query con los tipos de centros formateados para MCSelect
 */
export const useTiposCentros = (
  params?: Partial<TipoCentroParams>,
  options?: { enabled?: boolean; refetchOnMount?: boolean },
) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const queryClient = useQueryClient();

  const query = useQuery<SelectOption[], Error>({
    queryKey: QUERY_KEYS.TIPOS_CENTROS(currentLanguage, params),
    queryFn: () =>
      tiposCentrosService.getAllActiveTiposCentros(currentLanguage),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: options?.refetchOnMount ?? false,
    enabled: options?.enabled ?? true,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      try {
        const cacheKey = `tiposCentros_${currentLanguage}`;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: query.data,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.warn("Error saving tiposCentros to localStorage:", error);
      }
    }
  }, [query.data, currentLanguage]);

  useEffect(() => {
    if (!query.data) {
      try {
        const cacheKey = `tiposCentros_${currentLanguage}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isValid = Date.now() - timestamp < 1000 * 60 * 60 * 24 * 7;
          if (isValid && data) {
            queryClient.setQueryData(
              QUERY_KEYS.TIPOS_CENTROS(currentLanguage, params),
              data,
            );
          }
        }
      } catch (error) {
        console.warn("Error loading tiposCentros from localStorage:", error);
      }
    }
  }, [currentLanguage, params, queryClient, query.data]);

  return query;
};

/**
 * Hook para obtener tipos de centros con parámetros personalizados
 * Útil cuando necesitas más control sobre la query
 *
 * @param params - Parámetros completos para la API
 * @param enabled - Si la query debe ejecutarse automáticamente
 */
export const useTiposCentrosCustom = (
  params?: TipoCentroParams,
  enabled: boolean = true,
) => {
  const queryKeyParams = params as Record<string, unknown> | undefined;

  return useQuery<SelectOption[], Error>({
    queryKey: QUERY_KEYS.TIPOS_CENTRO_CUSTOM(queryKeyParams),
    queryFn: () => tiposCentrosService.getTiposCentroForSelect(params),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export default useTiposCentros;
