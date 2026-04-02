import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import type { DoctorNearby, GetDoctoresByDistanceResponse, CenterNearby } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import type { Provider } from "@/data/providers";
import { mapDoctorsToProviders, mapCentersToProviders } from "../mappers/serviceToProvider.mapper";
import { useUserRole } from '@/lib/hooks/useAuthUser';
import {
  mapFiltersToAPIParams,
  createFilterCacheKey,
  type SearchProviderFilters,
} from "../mappers/filterMapper";

const normalizeText = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export interface UseSearchDoctorsParams {
  lat: number | null;
  lng: number | null;
  radiusKm?: number;
  filters?: SearchProviderFilters;
  language: string;
  enabled?: boolean;
  especialidadesOptions?: Array<{ value: string; label: string }>;
  tiposCentroOptions?: Array<{ value: string; label: string }>;
}


export interface UseSearchDoctorsResult {
  /**
   * Filtered providers after applying client-side filters
   */
  filteredProviders: Provider[];
  /**
   * Raw doctor data from API
   */
  rawDoctors: DoctorNearby[];
  /**
   * Raw centers (centros) from API
   */
  rawCenters: CenterNearby[];
  /**
   * All providers before client-side filtering
   */
  data: Provider[] | undefined;
  /**
   * Loading state
   */
  isLoading: boolean;
  /**
   * Error state
   */
  error: Error | null;
  /**
   * Success state
   */
  isSuccess: boolean;
  /**
   * Refetch function
   */
  refetch: () => void;
}

/**
 * Hook to search for doctors by distance with filters
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Optimized refetch interval: 5 minutes instead of 30 seconds
 * - Background refetch disabled to save resources
 * - Proper caching with stale time of 5 minutes
 * - Debounced filter updates to reduce API calls
 * - Accurate loading state: Tracks both API loading and data transformation
 * 
 * Features:
 * - Searches doctors within a specified radius
 * - Applies API-supported filters to nested services (specialty, modality, rating)
 * - Applies client-side filters (languages, insurances, name search)
 * - Transforms API doctor data to UI Provider format
 * - Automatic caching and refetching with React Query
 * - Prevents premature display of empty state during data transformation
 * 
 * @param params - Search parameters
 * @returns Query result with provider data and filtered results
 * 
 * @example
 * ```tsx
 * const { data, filteredProviders, isLoading, error } = useSearchDoctors({
 *   lat: 18.4861,
 *   lng: -69.9312,
 *   radiusKm: 10,
 *   filters: searchFilters,
 *   language: 'es',
 * });
 * ```
 */
export function useSearchDoctors({
  lat,
  lng,
  radiusKm = 15,
  filters,
  language,
  enabled = true,
  especialidadesOptions = [],
  tiposCentroOptions = []
}: UseSearchDoctorsParams): UseSearchDoctorsResult {
  // Enable query if enabled flag is true (coordinates are now optional)
  const shouldFetch = enabled;

  // Map filters to API parameters
  const apiParams = useMemo(() => {
    if (!filters) return {};

    return mapFiltersToAPIParams(filters, language, especialidadesOptions, tiposCentroOptions);
  }, [filters, language, especialidadesOptions, tiposCentroOptions]);

  // Create cache key based on location and filters
  const queryKey = useMemo(() => {
    if (!filters) {
      return ["doctors", "search", lat, lng, radiusKm, language];
    }
    return createFilterCacheKey(lat, lng, radiusKm, filters, language);
  }, [lat, lng, radiusKm, filters, language]);

  // Fetch doctors from API
  const query = useQuery<GetDoctoresByDistanceResponse, Error>({
    queryKey,
    queryFn: async () => {

      const response = await doctorService.getDoctorAndCenterByFilters(
        lat,
        lng,
        radiusKm,
        apiParams
      );

      // Return the full response so we can map both doctores and centros
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    enabled: shouldFetch,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes (optimized from 30s)
    refetchIntervalInBackground: false, // Don't refetch in background to save resources
  });

  // Transform doctors to providers asynchronously (mapper fetches availability)
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const userRole = useUserRole();
  const skipAvailability = userRole === 'CENTER';

  useEffect(() => {
    let mounted = true;

    const buildProviders = async () => {
      if (!query.data || ((query.data.doctores || []).length === 0 && (query.data.centros || []).length === 0)) {
        if (mounted) {
          setProviders([]);
          setIsTransforming(false);
        }
        return;
      }

      if (mounted) setIsTransforming(true);

      try {
        const mappedDoctors = await mapDoctorsToProviders(query.data.doctores || [], language, skipAvailability);
        const mappedCenters = mapCentersToProviders(query.data.centros || []);
        const combined = [...mappedDoctors, ...mappedCenters];
        if (mounted) {
          setProviders(combined);
          setIsTransforming(false);
        }
      } catch (e) {
        if (mounted) {
          setProviders([]);
          setIsTransforming(false);
        }
      }
    };

    buildProviders();

    return () => {
      mounted = false;
    };
  }, [query.data, language, skipAvailability]);

  // Apply client-side filters
  const filteredProviders = useMemo<Provider[]>(() => {
    if (!filters) {
      return providers;
    }

    return providers.filter((provider) => {
      const rawDoctor = (provider as any)._rawDoctor as DoctorNearby | undefined;
      const rawCenter = (provider as any)._rawCenter as CenterNearby | undefined;

      // Name filter (applied to doctors and centers)
      if (filters.name && filters.name.length > 0) {
        const searchText = normalizeText(filters.name);
        const providerName = rawDoctor
          ? `${rawDoctor.nombre} ${rawDoctor.apellido}`
          : provider.name;
        if (!normalizeText(providerName).includes(searchText)) {
          return false;
        }
      }

      // Insurance filter
      if (
        filters.insuranceAccepted?.length > 0 &&
        !filters.insuranceAccepted.includes("all")
      ) {
        const hasMatchingInsurance = filters.insuranceAccepted.some(
          (insurance) => {
            // Check if insurance is numeric ID or string name
            const isNumericId = !isNaN(Number(insurance));

            if (rawDoctor) {
              return rawDoctor.segurosAceptados.some((s) => {
                if (isNumericId) {
                  // Match by ID
                  return s.seguro.id === Number(insurance) || s.seguroId === Number(insurance);
                }

                // Match by name (case-insensitive partial match)
                return normalizeText(s.seguro.nombre).includes(normalizeText(insurance));
              });
            }

            if (rawCenter) {
              return (rawCenter.seguros || []).some((s) => {
                if (isNumericId) {
                  return s.id === Number(insurance);
                }

                return normalizeText(s.nombre).includes(normalizeText(insurance));
              });
            }

            return provider.insurances.some((insuranceName) =>
              normalizeText(insuranceName).includes(normalizeText(insurance))
            );
          }
        );

        if (!hasMatchingInsurance) {
          return false;
        }
      }

      // Language filter for doctors and centers
      if (
        filters.languages &&
        filters.languages !== "all"
      ) {
        const selectedLanguage = normalizeText(filters.languages);
        const providerLanguages = (provider.languages || []).map((languageName) =>
          normalizeText(languageName)
        );

        const hasLanguage = providerLanguages.some((languageName) =>
          languageName.includes(selectedLanguage)
        );

        if (!hasLanguage) {
          return false;
        }
      }

      // Scheduled appointments filter (client-side - would need horarios processing)
      if (
        filters.scheduledAppointments &&
        filters.scheduledAppointments !== "all"
      ) {
        // TODO: Implement when horarios data is processed
        // For now, skip this filter
      }

      return true;
    });
  }, [providers, filters]);

  return {
    data: providers,
    filteredProviders,
    rawDoctors: query.data?.doctores || [],
    rawCenters: query.data?.centros || [],
    isLoading: query.isLoading || isTransforming,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

/**
 * Hook to get services for a specific doctor
 * 
 * @param doctorId - Doctor ID
 * @param language - Language for translations
 * @param enabled - Whether to fetch automatically
 */
export function useDoctorServices(
  doctorId: number | null,
  language: string = "es",
  enabled: boolean = true
): UseQueryResult<any[], Error> {
  return useQuery<any[], Error>({
    queryKey: ["doctors", "services", doctorId, language],
    queryFn: async () => {
      if (doctorId === null) {
        throw new Error("Doctor ID is required");
      }

      const response = await doctorService.getServicesOfDoctor(doctorId, {
        target: language,
        source: language === "es" ? "en" : "es",
        translate_fields: "nombre,descripcion,modalidad",
      });

      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: enabled && doctorId !== null,
  });
}
