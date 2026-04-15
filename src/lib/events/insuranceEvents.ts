// Eventos personalizados para notificar cambios en seguros

// ============= PATIENT INSURANCE EVENTS =============
export const PATIENT_INSURANCE_CHANGED_EVENT = "patient:insurance:changed";

/**
 * Emite un evento cuando los seguros del paciente cambian
 */
export function emitPatientInsuranceChanged() {
  const event = new CustomEvent(PATIENT_INSURANCE_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en los seguros del paciente
 * @param callback Función a ejecutar cuando los seguros cambien
 */
export function onPatientInsuranceChanged(callback: () => void) {
  window.addEventListener(PATIENT_INSURANCE_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(PATIENT_INSURANCE_CHANGED_EVENT, callback);
  };
}

// ============= DOCTOR INSURANCE EVENTS =============
export const DOCTOR_INSURANCE_CHANGED_EVENT = "doctor:insurance:changed";

/**
 * Emite un evento cuando los seguros aceptados por el doctor cambian
 */
export function emitDoctorInsuranceChanged() {
  console.log("📢 [Events] Emitting doctor insurance changed event");
  const event = new CustomEvent(DOCTOR_INSURANCE_CHANGED_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para escuchar cambios en los seguros aceptados por el doctor
 * @param callback Función a ejecutar cuando los seguros cambien
 */
export function onDoctorInsuranceChanged(callback: () => void) {
  window.addEventListener(DOCTOR_INSURANCE_CHANGED_EVENT, callback);
  
  // Retorna función de limpieza
  return () => {
    window.removeEventListener(DOCTOR_INSURANCE_CHANGED_EVENT, callback);
  };
}

// ============= BACKWARDS COMPATIBILITY =============
/**
 * @deprecated Use emitPatientInsuranceChanged instead
 */
export const emitInsuranceChanged = emitPatientInsuranceChanged;

/**
 * @deprecated Use onPatientInsuranceChanged instead
 */
export const onInsuranceChanged = onPatientInsuranceChanged;

export const INSURANCE_CHANGED_EVENT = PATIENT_INSURANCE_CHANGED_EVENT;
