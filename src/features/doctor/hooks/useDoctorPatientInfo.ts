import { useQuery } from "@tanstack/react-query";
import { getDoctorPatientInfo } from "@/services/api/appointments.service";
import { QUERY_KEYS } from "@/lib/react-query/config";
import type { DoctorPatientInfoFilters } from "@/types/DoctorStatsTypes";

interface UseDoctorPatientInfoOptions extends DoctorPatientInfoFilters {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export const useDoctorPatientInfo = (
  patientId?: string | number,
  {
    enabled = true,
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 30,
    ...filters
  }: UseDoctorPatientInfoOptions = {}
) =>
  useQuery({
    queryKey: [
      ...QUERY_KEYS.DOCTOR_PATIENT_INFO(patientId ?? "unknown"),
      filters,
    ],
    queryFn: () => getDoctorPatientInfo(patientId as string | number, filters),
    enabled: enabled && !!patientId,
    staleTime,
    gcTime,
  });
