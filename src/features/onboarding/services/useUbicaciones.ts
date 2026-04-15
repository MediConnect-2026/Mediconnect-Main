import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/lib/react-query/config';
import ubicacionesService from './ubicaciones.services';
import type { SelectOption } from './ubicaciones.types';
import type { DoctorLocation } from './ubicaciones.types';
import { useTranslation } from 'react-i18next';

type NivelGeografico = 'provincias' | 'municipios' | 'distritos' | 'secciones' | 'barrios' | 'subbarrios';

const isPositiveNumericId = (value: unknown): boolean => {
	const normalized = String(value ?? '').trim();
	return /^\d+$/.test(normalized) && Number(normalized) > 0;
};

/**
 * Hook para obtener ubicaciones geográficas jerárquicas
 * - provincias: búsqueda inicial
 * - municipios: requiere idProvincia
 * - distritos: requiere idMunicipio
 * - secciones: requiere idDistrito
 * - barrios: requiere idSeccion
 * - subbarrios: requiere idBarrio
 * * OPTIMIZACIONES:
 * - Cache en memoria: 24 horas
 * - Cache persistente: localStorage (7 días)
 * - staleTime: 30 minutos
 * - No refetch automático en windowFocus o reconnect
 * - Placeholder data para UX fluida durante updates
 */

// --- 1. SOBRECARGA PARA EL NIVEL 'DOCTOR' ---
export function useUbicaciones(
	nivel: 'doctor',
	params?: Record<string, any>,
	options?: { enabled?: boolean; refetchOnMount?: boolean }
): UseQueryResult<DoctorLocation[], Error>;

// --- 2. SOBRECARGA PARA LOS NIVELES GEOGRÁFICOS ---
export function useUbicaciones(
	nivel: NivelGeografico,
	params?: Record<string, any>,
	options?: { enabled?: boolean; refetchOnMount?: boolean }
): UseQueryResult<SelectOption[], Error>;

// --- 3. IMPLEMENTACIÓN REAL DEL HOOK ---
export function useUbicaciones(
	nivel: NivelGeografico | 'doctor',
	params?: Record<string, any>,
	options?: { enabled?: boolean; refetchOnMount?: boolean }
) {
	const queryClient = useQueryClient();
	const { i18n } = useTranslation();
	const currentLanguage = i18n.language;
	const source = currentLanguage === "en" ? "es" : "en";

	const hasValidHierarchyParams = () => {
		switch (nivel) {
			case 'municipios':
				return isPositiveNumericId(params?.idProvincia);
			case 'distritos':
				return isPositiveNumericId(params?.idMunicipio);
			case 'secciones':
				return isPositiveNumericId(params?.idDistrito) || isPositiveNumericId(params?.idMunicipio);
			case 'barrios':
				return isPositiveNumericId(params?.idSeccion);
			case 'subbarrios':
				return isPositiveNumericId(params?.idBarrio);
			default:
				return true;
		}
	};

	const shouldEnableQuery =
		(options?.enabled ?? true) && hasValidHierarchyParams();

	// Mapear nivel a función de servicio
	const fetchFn = () => {
		switch (nivel) {
			case 'provincias':
				return ubicacionesService.getProvincias(currentLanguage);
			case 'municipios':
				return ubicacionesService.getMunicipios(currentLanguage, Number(params?.idProvincia));
			case 'distritos':
				return ubicacionesService.getDistritos(currentLanguage, Number(params?.idMunicipio));
			case 'secciones': {
				const seccionesParams = isPositiveNumericId(params?.idDistrito)
					? { idDistrito: String(params?.idDistrito) }
					: isPositiveNumericId(params?.idMunicipio)
						? { idMunicipio: String(params?.idMunicipio) }
						: null;

				return seccionesParams
					? ubicacionesService.getSecciones(currentLanguage, seccionesParams)
					: Promise.resolve([]);
			}
			case 'barrios':
				return ubicacionesService.getBarrios(currentLanguage, Number(params?.idSeccion));
			case 'subbarrios':
				return ubicacionesService.getSubbarrios(currentLanguage, Number(params?.idBarrio));
			case 'doctor':
				return ubicacionesService.getLocationsByDoctor(currentLanguage, source, params);
			default:
				return Promise.resolve([]);
		}
	};

	// Cambia el tipo de retorno según el nivel
	const query = nivel === 'doctor' ? useQuery<DoctorLocation[], Error>({
		queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
		queryFn: fetchFn,
		staleTime: 1000 * 60 * 30, // 30 minutos
		gcTime: 1000 * 60 * 60 * 24, // 24 horas
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: options?.refetchOnMount ?? false,
		enabled: shouldEnableQuery,
		placeholderData: (previousData) => previousData,
	}) : useQuery<SelectOption[], Error>({
		queryKey: QUERY_KEYS.UBICACIONES(nivel, params),
		queryFn: fetchFn as () => Promise<SelectOption[]>, // Pequeño casteo interno para evitar quejas de TS en el switch
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60 * 24,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: options?.refetchOnMount ?? false,
		enabled: shouldEnableQuery,
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

	// Hacemos un "as any" en el return de la implementación base 
	// porque las sobrecargas de arriba ya se encargan de dictar el tipado estricto hacia afuera.
	return query as any;
}

export default useUbicaciones;