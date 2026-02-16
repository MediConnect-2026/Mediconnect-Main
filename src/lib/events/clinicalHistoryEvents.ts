// Eventos personalizados para notificar cambios en el historial clínico del paciente

export const ALLERGIES_CHANGED_EVENT = "patient:allergies:changed";
export const CONDITIONS_CHANGED_EVENT = "patient:conditions:changed";
export const CLINICAL_HISTORY_CHANGED_EVENT = "patient:clinical-history:changed";

/**
 * Emite un evento cuando las alergias del paciente cambian
 */
export function emitAllergiesChanged() {
  const event = new CustomEvent(ALLERGIES_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Emite un evento cuando las condiciones médicas del paciente cambian
 */
export function emitConditionsChanged() {
  const event = new CustomEvent(CONDITIONS_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Emite un evento cuando cualquier parte del historial clínico cambia
 * (alergias, condiciones, o cualquier otro dato médico)
 */
export function emitClinicalHistoryChanged() {
  const event = new CustomEvent(CLINICAL_HISTORY_CHANGED_EVENT);
  window.dispatchEvent(event);
  // También emitir eventos específicos
  emitAllergiesChanged();
  emitConditionsChanged();
}

/**
 * Hook para escuchar cambios en las alergias del paciente
 * @param callback Función a ejecutar cuando las alergias cambien
 */
export function onAllergiesChanged(callback: () => void) {
  window.addEventListener(ALLERGIES_CHANGED_EVENT, callback);
  
  return () => {
    window.removeEventListener(ALLERGIES_CHANGED_EVENT, callback);
  };
}

/**
 * Hook para escuchar cambios en las condiciones médicas del paciente
 * @param callback Función a ejecutar cuando las condiciones cambien
 */
export function onConditionsChanged(callback: () => void) {
  window.addEventListener(CONDITIONS_CHANGED_EVENT, callback);
  
  return () => {
    window.removeEventListener(CONDITIONS_CHANGED_EVENT, callback);
  };
}

/**
 * Hook para escuchar cambios en cualquier parte del historial clínico
 * @param callback Función a ejecutar cuando el historial clínico cambie
 */
export function onClinicalHistoryChanged(callback: () => void) {
  window.addEventListener(CLINICAL_HISTORY_CHANGED_EVENT, callback);
  
  return () => {
    window.removeEventListener(CLINICAL_HISTORY_CHANGED_EVENT, callback);
  };
}
