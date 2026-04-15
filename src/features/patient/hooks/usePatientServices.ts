import { useQuery } from '@tanstack/react-query';
import { getPatientServices } from '@/services/api/appointments.service';

/**
 * Hook para obtener los servicios a los cuales el paciente ha realizado alguna consulta
 * 
 * @param pacienteId - ID del paciente
 * @returns Query con la lista de servicios
 */
export const usePatientServices = (pacienteId?: string | number) => {
  return useQuery({
    queryKey: ['patient-services', pacienteId],
    queryFn: () => getPatientServices(pacienteId!),
    enabled: !!pacienteId,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
};

export default usePatientServices;
