/**
 * calendarTransformers.ts
 * Utilidades para transformar datos de la API al formato del calendario local
 */
import type { CitaDetalle, CitaEstado } from '@/types/AppointmentTypes';
import type { Appointment, AppointmentStatus } from '@/types/CalendarTypes';

/**
 * Formatea un número de teléfono al formato (xxx)-xxx-xxxx
 */
const formatPhoneNumber = (phone?: string | null): string | undefined => {
  if (!phone) return undefined;

  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Verificar que tenga al menos 10 dígitos
  if (cleaned.length < 10) return phone; // Retornar original si no es válido

  // Formatear al estilo (xxx)-xxx-xxxx
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]})-${match[2]}-${match[3]}`;
  }

  return phone; // Retornar original si no coincide con el patrón
};

/**
 * Mapea el estado de la cita del backend al estado local
 */
const mapCitaEstadoToAppointmentStatus = (estado: CitaEstado | string): AppointmentStatus => {
  const normalizedEstado = String(estado).trim().toLowerCase();

  const statusMap: Record<string, AppointmentStatus> = {
    'programada': 'scheduled',
    'en progreso': 'in_progress',
    'en curso': 'in_progress',
    'completada': 'completed',
    'cancelada': 'cancelled',
    'reprogramada': 'scheduled',
    'pendiente': 'pending',
  };

  return statusMap[normalizedEstado] || 'pending';
};

/**
 * Determina el tipo de cita basándose en la información disponible
 */
const determineAppointmentType = (_cita: CitaDetalle): Appointment['type'] => {
  // Por ahora retornamos 'consulta' como default
  // En el futuro se puede agregar lógica para determinar el tipo basado en:
  // - servicio.nombre
  // - motivoConsulta
  // - otros campos relevantes
  return 'consulta';
};

/**
 * Transforma una cita del backend al formato local de Appointment
 * 
 * @param cita - Cita del backend
 * @returns Cita en formato local
 */
export const transformCitaToAppointment = (cita: CitaDetalle): Appointment => {
  // Parsear fecha y hora por separado para evitar problemas de zona horaria
  // fechaInicio viene en formato YYYY-MM-DD
  // horaInicio viene en formato HH:mm:ss o HH:mm
  const [year, month, day] = cita.fechaInicio.split('-').map(Number);
  const [hour, minute] = cita.horaInicio.split(':').map(Number);

  // Crear Date en la zona horaria local (importante para comparaciones con isSameDay)
  const dateTime = new Date(year, month - 1, day, hour, minute);

  // Debug: Log para verificar la transformación
  console.debug('[Transformer] Cita:', cita);


  return {
    id: cita.id.toString(),
    doctorId: cita.doctor.usuarioId?.toString() || '',
    patientId: cita.paciente.usuarioId?.toString() || '',
    patientName: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
    patientAvatarUrl: cita.paciente.usuario.fotoPerfil || undefined,
    doctorName: `${cita.doctor.nombre} ${cita.doctor.apellido}`,
    doctorAvatarUrl: cita.doctor.usuario.fotoPerfil || undefined,
    doctorSpecialty: cita.servicio.especialidad.nombre,
    date: dateTime,
    time: cita.horaInicio,
    duration: cita.servicio.duracionMinutos,
    type: determineAppointmentType(cita),
    status: mapCitaEstadoToAppointmentStatus(cita.estado),
    notes: cita.motivoConsulta || undefined,
    patientEmail: cita.paciente.usuario.email,
    doctorEmail: cita.doctor.usuario.email,
    modality: cita.modalidad?.toLowerCase() === 'teleconsulta' ? 'virtual' : cita.modalidad?.toLowerCase() === 'presencial' ? 'presencial' : 'mixta',
    service: cita.servicio.nombre,
    price: cita.totalAPagar,
    numberOfSessions: cita.servicio.sesiones || undefined,
    location: {
      lat: cita.servicio.latitude || 0,
      lng: cita.servicio.longitude || 0,
    },
    // Campos opcionales que pueden no estar disponibles
    address: cita.servicio.ubicaciones.direccionCompleta, // El backend no devuelve la dirección directamente
    patientPhone: undefined,
    doctorPhone: formatPhoneNumber(cita?.doctor?.usuario?.telefono),
  };
};

/**
 * Transforma un array de citas del backend al formato local
 * 
 * @param citas - Array de citas del backend
 * @returns Array de citas en formato local
 */
export const transformCitasToAppointments = (citas: CitaDetalle[]): Appointment[] => {
  return citas.map(transformCitaToAppointment);
};

/**
 * Agrupa y aplana las citas del calendario por fecha
 * Útil para transformar la respuesta del endpoint /citas/calendario
 * 
 * @param dias - Días con citas del calendario
 * @returns Array plano de todas las citas transformadas
 */
export const flattenCalendarioDias = (
  dias: Array<{ fecha: string; total: number; citas: CitaDetalle[] }>
): Appointment[] => {
  const allCitas = dias.flatMap(dia => dia.citas);
  return transformCitasToAppointments(allCitas);
};
