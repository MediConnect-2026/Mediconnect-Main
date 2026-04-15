import { useAppStore } from '@/stores/useAppStore';
import { getUserFullName, getUserAppRole, getUserAvatar, type User, type AppUserRole } from '@/services/auth/auth.types';

/**
 * Usuario extendido con propiedades computadas para mantener
 * compatibilidad con código existente
 */
export interface ExtendedUser extends User {
  name: string;
  role: AppUserRole | null;
  avatar?: string;
}

/**
 * Hook personalizado para obtener el usuario autenticado con propiedades computadas
 * 
 * Retorna el objeto User del API con propiedades adicionales:
 * - name: Nombre completo según el rol (doctor, paciente, centro)
 * - role: Rol de la aplicación (PATIENT, DOCTOR, CENTER, ADMINISTRATOR)
 * - avatar: URL del avatar según el rol
 * 
 * @returns Usuario extendido o null si no está autenticado
 */
export function useAuthUser(): ExtendedUser | null {
  const user = useAppStore((state) => state.user);
  
  if (!user) return null;
  
  return {
    ...user,
    name: getUserFullName(user),
    role: getUserAppRole(user),
    avatar: getUserAvatar(user),
  };
}

/**
 * Hook para verificar si el usuario está autenticado
 */
export function useIsAuthenticated(): boolean {
  return useAppStore((state) => state.isAuthenticated);
}

/**
 * Hook para obtener el rol del usuario actual
 */
export function useUserRole(): AppUserRole | null {
  const user = useAppStore((state) => state.user);
  return getUserAppRole(user);
}
