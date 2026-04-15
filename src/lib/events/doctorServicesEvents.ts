// Eventos personalizados para notificar cambios en los servicios del doctor

// ============= DOCTOR SERVICES EVENTS =============
export const DOCTOR_SERVICES_CHANGED_EVENT = "doctor:services:changed";

/**
 * Emite un evento cuando los servicios del doctor cambian
 * (crear, editar, eliminar, activar, desactivar)
 */
export function emitDoctorServicesChanged() {
  console.log("📢 [Events] Emitting doctor services changed event");
  const event = new CustomEvent(DOCTOR_SERVICES_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en los servicios del doctor
 * @param callback Función a ejecutar cuando los servicios cambien
 * @returns Función de limpieza para remover el listener
 */
export function onDoctorServicesChanged(callback: () => void) {
  window.addEventListener(DOCTOR_SERVICES_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(DOCTOR_SERVICES_CHANGED_EVENT, callback);
  };
}
