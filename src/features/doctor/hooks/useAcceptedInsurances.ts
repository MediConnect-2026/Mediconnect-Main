import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { doctorService } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service';
import type { Seguro } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types';

const normalizeLanguageCode = (language?: string): 'es' | 'en' =>
  language?.toLowerCase().startsWith('en') ? 'en' : 'es';

/**
 * Hook para obtener los seguros aceptados por el doctor actual
 * Los datos se actualizan en idioma actual
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con los seguros aceptados por el doctor
 * 
 * @example
 * const { data: acceptedInsurances = [], isLoading } = useAcceptedInsurances();
 */
export const useAcceptedInsurances = (options?: {
  enabled?: boolean;
  staleTime?: number;
  doctorId?: number; // Si se quiere obtener para un doctor específico, aunque por defecto se asume el doctor logueado
  target?: string;
  source?: string;
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
  const target = normalizeLanguageCode(options?.target ?? currentLanguage);
  const source = normalizeLanguageCode(options?.source ?? (target === 'en' ? 'es' : 'en'));
  const translate_fields = 'nombre,descripcion';

  return useQuery({
    // include doctorId in the key so queries are cached per doctor + language
    queryKey: [...QUERY_KEYS.ACCEPTED_INSURANCES(target), options?.doctorId ?? 0],
    queryFn: async () => {

      const response = options?.doctorId && options?.doctorId > 0 ? await doctorService.getAcceptedInsurancesByDoctorId(options?.doctorId, target, source, translate_fields) : await doctorService.getAcceptedInsurances(target, source, translate_fields);
      if (!response.success) {
        throw new Error('Error al cargar seguros aceptados');
      }

      // Transformar la estructura anidada de la API a objetos Seguro
      const transformedInsurances: Seguro[] = response.data.map(item => ({
        id: item.seguro.id,
        nombre: item.seguro.nombre,
        descripcion: item.seguro.descripcion,
        idTipoSeguro: item.tipoSeguro.id,
        urlImage: item.seguro.urlImage,
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

export default useAcceptedInsurances;
