// Eventos personalizados para notificar cambios en las experiencias laborales del doctor

export const EXPERIENCE_CHANGED_EVENT = "doctor:experience:changed";

/**
 * Emite un evento cuando las experiencias laborales del doctor cambian
 */
export function emitExperienceChanged() {
  console.log("📢 [Events] Emitting doctor experience changed event");
  const event = new CustomEvent(EXPERIENCE_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en las experiencias laborales del doctor
 * @param callback Función a ejecutar cuando las experiencias cambien
 */
export function onExperienceChanged(callback: () => void) {
  window.addEventListener(EXPERIENCE_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(EXPERIENCE_CHANGED_EVENT, callback);
  };
}
