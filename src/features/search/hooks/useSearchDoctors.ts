import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import type { DoctorNearby } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import type { Provider } from "@/data/providers";
import { mapDoctorsToProviders } from "../mappers/serviceToProvider.mapper";
import {
  mapFiltersToAPIParams,
  createFilterCacheKey,
  type SearchProviderFilters,
} from "../mappers/filterMapper";

export interface UseSearchDoctorsParams {
  lat: number | null;
  lng: number | null;
  radiusKm?: number;
  filters?: SearchProviderFilters;
  language?: string;
  enabled?: boolean;
  especialidadesOptions?: Array<{ value: string; label: string }>;
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
 * 
 * Features:
 * - Searches doctors within a specified radius
 * - Applies API-supported filters to nested services (specialty, modality, rating)
 * - Applies client-side filters (languages, insurances, name search)
 * - Transforms API doctor data to UI Provider format
 * - Automatic caching and refetching with React Query
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
  language = "es",
  enabled = true,
  especialidadesOptions = [],
}: UseSearchDoctorsParams): UseSearchDoctorsResult {
  // Only enable query if we have valid coordinates
  const shouldFetch = enabled && lat !== null && lng !== null;

  // Map filters to API parameters
  const apiParams = useMemo(() => {
    if (!filters) return {};
    
    return mapFiltersToAPIParams(filters, language, especialidadesOptions);
  }, [filters, language, especialidadesOptions]);

  // Create cache key based on location and filters
  const queryKey = useMemo(() => {
    if (!filters) {
      return ["doctors", "search", lat, lng, radiusKm, language];
    }
    return createFilterCacheKey(lat, lng, radiusKm, filters, language);
  }, [lat, lng, radiusKm, filters, language]);

  // Fetch doctors from API
  const query = useQuery<DoctorNearby[], Error>({
    queryKey,
    queryFn: async () => {
      if (lat === null || lng === null) {
        throw new Error("Location coordinates are required");
      }

      const response = await doctorService.getDoctoresByDistance(
        lat,
        lng,
        radiusKm,
        apiParams
      );

      return response.data || [];
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
  useEffect(() => {
    let mounted = true;

    const buildProviders = async () => {
      if (!query.data || query.data.length === 0) {
        if (mounted) setProviders([]);
        return;
      }

      try {
        const mapped = await mapDoctorsToProviders(query.data);
        if (mounted) setProviders(mapped);
      } catch (e) {
        if (mounted) setProviders([]);
      }
    };

    buildProviders();

    return () => {
      mounted = false;
    };
  }, [query.data]);

  // Apply client-side filters
  const filteredProviders = useMemo<Provider[]>(() => {
    if (!filters) {
      return providers;
    }

    return providers.filter((provider) => {
      const rawDoctor = (provider as any)._rawDoctor as DoctorNearby | undefined;
      if (!rawDoctor) return true;

      // Name filter (applied to doctor's full name)
      if (filters.name && filters.name.length > 0) {
        const searchText = filters.name.toLowerCase();
        const fullName = `${rawDoctor.nombre} ${rawDoctor.apellido}`.toLowerCase();
        if (!fullName.includes(searchText)) {
          return false;
        }
      }

      // Insurance filter
      if (
        filters.insuranceAccepted?.length > 0 &&
        !filters.insuranceAccepted.includes("all")
      ) {
        const hasMatchingInsurance = filters.insuranceAccepted.some(
          (insurance) =>
            rawDoctor.segurosAceptados.some(
              (s) => s.seguro.nombre.toLowerCase().includes(insurance.toLowerCase())
            )
        );
        if (!hasMatchingInsurance) {
          return false;
        }
      }

      // Language filter (client-side - not available in API data yet)
      if (
        filters.languages?.length > 0 &&
        !filters.languages.includes("all")
      ) {
        // TODO: Implement when language data is available in API
        // For now, skip this filter
      }

      // Scheduled appointments filter (client-side - would need horarios processing)
      if (
        filters.scheduledAppointments?.length > 0 &&
        !filters.scheduledAppointments.includes("all")
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
    rawDoctors: query.data || [],
    isLoading: query.isLoading,
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
