// Eventos personalizados para notificar cambios en formaciones academicas del doctor
export const ACADEMIC_CHANGED_EVENT = "doctor:academic:changed";

/**
 * Emite un evento cuando las formaciones academicas del doctor cambian
 */
export function emitAcademicChanged() {
  console.log("📢 [Events] Emitting doctor academic changed event");
  const event = new CustomEvent(ACADEMIC_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en las formaciones academicas del doctor
 * @param callback Función a ejecutar cuando las formaciones cambien
 */
export function onAcademicChanged(callback: () => void) {
  window.addEventListener(ACADEMIC_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(ACADEMIC_CHANGED_EVENT, callback);
  };
}
