// Eventos personalizados para notificar cambios en los idiomas del doctor

export const DOCTOR_LANGUAGE_CHANGED_EVENT = "doctor:language:changed";

/**
 * Emite un evento cuando los idiomas del doctor cambian
 */
export function emitDoctorLanguageChanged() {
  console.log("📢 [Events] Emitting doctor language changed event");
  const event = new CustomEvent(DOCTOR_LANGUAGE_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en los idiomas del doctor
 * @param callback Función a ejecutar cuando los idiomas cambien
 */
export function onDoctorLanguageChanged(callback: () => void) {
  window.addEventListener(DOCTOR_LANGUAGE_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(DOCTOR_LANGUAGE_CHANGED_EVENT, callback);
  };
}
