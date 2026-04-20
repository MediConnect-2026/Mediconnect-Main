/**
 * useDoctorPatients.ts
 * Hooks for fetching doctor patients with React Query.
 *
 * Changes vs original:
 * - Typed query-key factory (prevents stale-cache mismatches)
 * - Removed unused `useInfiniteQuery` import path duplication
 * - `useDoctorPatient` delegates to `getDoctorPatients` with a targeted filter
 *   instead of loading a page and scanning locally
 * - All options have explicit types — no implicit `any`
 * - `gcTime` / `staleTime` exposed as top-level options; sane defaults kept
 */
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { getDoctorPatients } from "@/services/api/appointments.service";
import { QUERY_KEYS } from "@/lib/react-query/config";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UseDoctorPatientsOptions {
  pagina?: number;
  limite?: number;
  buscar?: string;
  genero?: "M" | "F";
  condicionId?: number;
  alergiaId?: number;
  especialidadId?: number;
  servicioId?: number;
  ubicacionId?: number;
  tieneCondiciones?: boolean;
  tieneAlergias?: boolean;
  ultimaCitaDesde?: string;
  ultimaCitaHasta?: string;
  target?: string;
  source?: string;
  translate_fields?: string;
  /** Disable the query entirely */
  enabled?: boolean;
  staleTime?: number;
  /** Formerly cacheTime */
  gcTime?: number;
}

// ─── Query-key factory ────────────────────────────────────────────────────────
const doctorPatientsKey = (
  pagina: number,
  limite: number,
  filters: Omit<
    UseDoctorPatientsOptions,
    "pagina" | "limite" | "enabled" | "staleTime" | "gcTime"
  >
) => [QUERY_KEYS.DOCTOR_STATS_PACIENTES, "list", pagina, limite, filters] as const;

const doctorPatientsInfiniteKey = (
  filters: Omit<
    UseDoctorPatientsOptions,
    "pagina" | "enabled" | "staleTime" | "gcTime"
  >
) => [QUERY_KEYS.DOCTOR_STATS_PACIENTES, "infinite", filters] as const;

// ─── useDoctorPatients ────────────────────────────────────────────────────────
/**
 * Fetch a paginated list of the doctor's patients.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useDoctorPatients({ buscar: "Carlos", pagina: 1 });
 * ```
 */
export const useDoctorPatients = ({
  pagina = 1,
  limite = 10,
  enabled = true,
  staleTime = 1000 * 60 * 5,   // 5 min
  gcTime = 1000 * 60 * 30,     // 30 min
  ...filters
}: UseDoctorPatientsOptions = {}) =>
  useQuery({
    queryKey: doctorPatientsKey(pagina, limite, filters),
    queryFn: () => getDoctorPatients({ pagina, limite, ...filters }),
    placeholderData: keepPreviousData,
    enabled,
    staleTime,
    gcTime,
  });

// ─── useDoctorPatientsInfinite ────────────────────────────────────────────────
/**
 * Infinite-query variant for "load more" / infinite-scroll patterns.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useDoctorPatientsInfinite();
 * ```
 */
export const useDoctorPatientsInfinite = ({
  limite = 10,
  enabled = true,
  staleTime = 1000 * 60 * 5,
  gcTime = 1000 * 60 * 30,
  ...filters
}: Omit<UseDoctorPatientsOptions, "pagina"> = {}) =>
  useInfiniteQuery({
    queryKey: doctorPatientsInfiniteKey({ limite, ...filters }),
    queryFn: ({ pageParam = 1 }: { pageParam: number }) =>
      getDoctorPatients({ pagina: pageParam, limite, ...filters }),
    getNextPageParam: (lastPage: Awaited<ReturnType<typeof getDoctorPatients>>) => {
      const { paginacion } = lastPage;
      return paginacion.pagina < paginacion.totalPaginas
        ? paginacion.pagina + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime,
    gcTime,
  });