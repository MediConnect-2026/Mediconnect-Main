import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { patientService } from '@/shared/navigation/userMenu/editProfile/patient/services/patient.service';
import type { Seguro } from '@/shared/navigation/userMenu/editProfile/patient/services/patient.types';

/**
 * Hook para obtener los seguros del paciente actual
 * Los datos se actualizan en idioma actual
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con los seguros del paciente
 * 
 * @example
 * const { data: myInsurances = [], isLoading } = useMyInsurances();
 */
export const useMyInsurances = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'es';

  return useQuery({
    queryKey: QUERY_KEYS.MY_INSURANCES(language),
    queryFn: async () => {
      const response = await patientService.getMyInsurances(language);
      if (!response.success) {
        throw new Error('Error al cargar tus seguros');
      }
      
      // Transformar la estructura anidada de la API a objetos Seguro
      const transformedInsurances: Seguro[] = response.data.map(item => ({
        id: item.seguro.id,
        nombre: item.seguro.nombre,
        descripcion: item.seguro.descripcion,
        idTipoSeguro: item.tipoSeguro.id,
        tipoSeguro: item.tipoSeguro,
      }));
      
      return transformedInsurances;
    },
    // Caché moderado: 5 minutos (puede cambiar con más frecuencia que el catálogo)
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    // Garbage collection: 10 minutos
    gcTime: 1000 * 60 * 10,
    // Refetch al enfocar la ventana para tener datos actualizados
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: options?.enabled ?? true,
  });
};

export default useMyInsurances;
