// Event personalizado para notificar cambios en seguros del paciente

export const INSURANCE_CHANGED_EVENT = "patient:insurance:changed";

/**
 * Emite un evento cuando los seguros del paciente cambian
 */
export function emitInsuranceChanged() {
  const event = new CustomEvent(INSURANCE_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en los seguros del paciente
 * @param callback Función a ejecutar cuando los seguros cambien
 */
export function onInsuranceChanged(callback: () => void) {
  window.addEventListener(INSURANCE_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(INSURANCE_CHANGED_EVENT, callback);
  };
}
