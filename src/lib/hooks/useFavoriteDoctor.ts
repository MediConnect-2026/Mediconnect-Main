import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para agregar un doctor a favoritos
 */
export const useAddDoctorToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, number, { previous: unknown }>({
    mutationFn: async (doctorId: number) => {
      return await doctorService.addDoctorToFavorites(doctorId);
    },
    onMutate: async (doctorId: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.DOCTOR_BY_ID(doctorId) });
      const previous = queryClient.getQueryData(QUERY_KEYS.DOCTOR_BY_ID(doctorId));

      // Optimistic update: mark doctor as favorite in cached doctor-by-id
      queryClient.setQueryData(QUERY_KEYS.DOCTOR_BY_ID(doctorId), (old: unknown) => {
        if (!old) return old;
        if (Array.isArray(old)) return old; // unexpected shape
        if (typeof old !== 'object') return old;
        return {
          ...old,
          isFavorite: true,
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.DOCTOR_BY_ID(variables), context.previous);
      }
      console.error('Error adding doctor to favorites', err);
    },
    onSuccess: (_, doctorId) => {
      // Invalidate doctors lists to refresh UI
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCTORS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCTOR_BY_ID(doctorId) });
    },
  });
};

export const useRemoveDoctorFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, number, { previous: unknown }>({
    mutationFn: async (doctorId: number) => {
      return await doctorService.removeDoctorFromFavorites(doctorId);
    },
    onMutate: async (doctorId: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.DOCTOR_BY_ID(doctorId) });
      const previous = queryClient.getQueryData(QUERY_KEYS.DOCTOR_BY_ID(doctorId));

      // Optimistic update: mark doctor as not favorite in cached doctor-by-id
      queryClient.setQueryData(QUERY_KEYS.DOCTOR_BY_ID(doctorId), (old: unknown) => {
        if (!old) return old;
        if (Array.isArray(old)) return old;
        if (typeof old !== 'object') return old;
        return {
          ...old,
          isFavorite: false,
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.DOCTOR_BY_ID(variables), context.previous);
      }
      console.error('Error removing doctor from favorites', err);
    },
    onSuccess: (_, doctorId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCTORS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCTOR_BY_ID(doctorId) });
    },
  });
};
