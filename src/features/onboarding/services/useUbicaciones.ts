import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/lib/react-query/config';
import ubicacionesService from './ubicaciones.services';
import type { SelectOption } from './ubicaciones.types';
import { useTranslation } from 'react-i18next';

/**
 * Hook para obtener ubicaciones geográficas jerárquicas
 * - provincias: búsqueda inicial
 * - municipios: requiere idProvincia
 * - distritos: requiere idMunicipio
 * - secciones: requiere idDistrito
 * - barrios: requiere idSeccion
 * - subbarrios: requiere idBarrio
 *
 * OPTIMIZACIONES:
 * - Cache en memoria: 24 horas
 * - Cache persistente: localStorage (7 días)
 * - staleTime: 30 minutos
 * - No refetch automático en windowFocus o reconnect
 * - Placeholder data para UX fluida durante updates
 *
 * @param nivel - provincia | municipio | distrito | seccion | barrio | subbarrio
 * @param params - parámetros para la búsqueda (ej: { idProvincia })
 * @param options - enabled, refetchOnMount
 */
export const useUbicaciones = (
	nivel: 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios',
	params?: Record<string, any>,
	options?: { enabled?: boolean; refetchOnMount?: boolean }
) => {
	const queryClient = useQueryClient();
    const {i18n} = useTranslation();
    const currentLanguage = i18n.language;

	// Mapear nivel a función de servicio
	const fetchFn = () => {
        console.log(`Fetching ubicaciones for nivel: ${nivel} with params:`, params);
		switch (nivel) {
			case 'provincias':
				return ubicacionesService.getProvincias(currentLanguage);
			case 'municipios':
				return ubicacionesService.getMunicipios(currentLanguage, Number(params?.idProvincia));
			case 'distritos':
				return ubicacionesService.getDistritos(currentLanguage, Number(params?.idMunicipio));
			case 'secciones':
				return ubicacionesService.getSecciones(currentLanguage, params);
			case 'barrios':
				return ubicacionesService.getBarrios(currentLanguage, Number(params?.idSeccion));
			case 'subbarrios':
				return ubicacionesService.getSubbarrios(currentLanguage, Number(params?.idBarrio));
			default:
				return Promise.resolve([]);
		}
	};

	const query = useQuery<SelectOption[], Error>({
		queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
		queryFn: fetchFn,
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60 * 24,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: options?.refetchOnMount ?? false,
		enabled: options?.enabled ?? true,
		placeholderData: (previousData) => previousData,
	});

	// Persistir en localStorage cuando los datos cambien
	useEffect(() => {
		if (query.data && query.data.length > 0) {
			try {
				const cacheKey = `ubicaciones_${nivel}${params ? '_' + Object.values(params).join('_') : ''}`;
				localStorage.setItem(cacheKey, JSON.stringify({
					data: query.data,
					timestamp: Date.now(),
				}));
			} catch (error) {
				console.warn('Error saving ubicaciones to localStorage:', error);
			}
		}
	}, [query.data, nivel, params]);

	// Cargar desde localStorage si no hay data en cache
	useEffect(() => {
		if (!query.data) {
			try {
				const cacheKey = `ubicaciones_${nivel}${params ? '_' + Object.values(params).join('_') : ''}`;
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					const { data, timestamp } = JSON.parse(cached);
					const isValid = Date.now() - timestamp < 1000 * 60 * 60 * 24 * 7;
					if (isValid && data) {
						queryClient.setQueryData(
							QUERY_KEYS.UBICACIONES(nivel, params),
							data
						);
					}
				}
			} catch (error) {
				console.warn('Error loading ubicaciones from localStorage:', error);
			}
		}
	}, [currentLanguage, nivel, params, queryClient, query.data]);

	return query;
};

export default useUbicaciones;