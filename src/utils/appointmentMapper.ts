import type { CitaDetalle, CitaEstado } from '@/types/AppointmentTypes';
import type { Appointment, AppointmentStatus } from '@/shared/components/calendar/AppointmentCard';
import type { ServiceDetail, ServiceDetailDoctor } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types';
import { format, parseISO } from 'date-fns';

/**
 * Mapea el estado de la API al estado del componente
 */
export const mapCitaEstadoToAppointmentStatus = (estado: CitaEstado | string): AppointmentStatus => {
  const normalizedEstado = String(estado)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  const statusMap: Record<string, AppointmentStatus> = {
    'programada': 'scheduled',
    'scheduled': 'scheduled',
    'en progreso': 'in_progress',
    'in progress': 'in_progress',
    'en curso': 'in_progress',
    'completada': 'completed',
    'completed': 'completed',
    'cancelada': 'cancelled',
    'cancelled': 'cancelled',
    'reprogramada': 'scheduled',
    'pendiente': 'pending',
    'pending': 'pending',
  };

  return statusMap[normalizedEstado] || 'pending';
};

/**
 * Verifica si la modalidad es virtual/teleconsulta
 */
export const isVirtualModality = (modalidad: string): boolean => {
  return modalidad.toLowerCase().includes('virtual') || modalidad.toLowerCase().includes('teleconsulta');
};

// Formatear la hora en 12h aceptando varios formatos:
// - ISO datetime (2026-03-09T09:30:00.000Z)
// - Hora simple ("11:00" o "9:30")
// - Hora con segundos ("11:00:00")
// - Con sufijo am/pm ("9:30 a.m.", "9:30 pm")
export const formatTimeTo12h = (time?: string | null): string | undefined => {
  if (!time) return undefined;

  // Caso: datetime ISO
  if (time.includes('T')) {
    const parts = time.split('T');
    if (parts.length < 2) return undefined;
    const timePart = parts[1]; // e.g. "09:30:00.000Z"
    const [hoursStr, minutesStr] = timePart.split(":");
    if (!hoursStr || !minutesStr) return undefined;
    const hour24 = parseInt(hoursStr, 10);
    const minutes = minutesStr.slice(0, 2);
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  }

  // Caso: hora simple HH:mm or H:mm or HH:mm:ss
  const simpleMatch = time.match(/^(\d{1,2}):(\d{2})(:?\d{2})?$/);
  if (simpleMatch) {
    const hour24 = parseInt(simpleMatch[1], 10);
    const minutes = simpleMatch[2];
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  }

  // Caso: con sufijo a.m./p.m. (variantes: a.m., p.m., am, pm)
  const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.|am|pm)$/i);
  if (ampmMatch) {
    const hour = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const suffix = ampmMatch[3].toLowerCase();
    const period = /p/i.test(suffix) ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minutes} ${period}`;
  }

  // Fallback: intentar parse ISO y formatear
  try {
    const d = parseISO(time);
    if (!isNaN(d.getTime())) return format(d, 'h:mm a');
  } catch (e) {
    // No es un formato reconocible
    console.warn(`No se pudo parsear la hora: ${time}`, e);
  }

  return undefined;
};

/**
 * Convierte una CitaDetalle del backend al formato Appointment del componente
 */
export const mapCitaDetalleToAppointment = (cita: CitaDetalle, userRole: string): Appointment => {
  // Parseamos solo para obtener el `Date` completo (fecha en local)
  const fechaInicio = parseISO(cita.fechaInicio);
  const fechaFin = cita.fechaFin ? parseISO(cita.fechaFin) : undefined;

  const startTime = formatTimeTo12h(cita.horaInicio) || format(fechaInicio, 'h:mm a');
  const endTime = cita.horaFin ? (formatTimeTo12h(cita.horaFin) || (fechaFin ? format(fechaFin, 'h:mm a') : undefined)) : undefined;

  // Extraer el doctorId para poder reagendar: prioriza el campo raíz, luego el usuarioId anidado
  const resolvedDoctorId = cita.doctorId ?? cita.doctor.usuarioId;
  const doctorId = resolvedDoctorId?.toString();

  // Construir serviceData con los campos que necesita ScheduleAppointmentDialog
  const serviceData: Partial<ServiceDetail> = {
    doctorId: resolvedDoctorId,
    doctor: {
      usuarioId: resolvedDoctorId ?? 0,
      nombre: cita.doctor.nombre,
      apellido: cita.doctor.apellido,
      usuario: {
        id: resolvedDoctorId ?? 0,
        email: cita.doctor.usuario.email,
        fotoPerfil: cita.doctor.usuario.fotoPerfil ?? '',
      },
    } as ServiceDetailDoctor,
    especialidad: {
      id: cita.servicio.especialidad.id,
      nombre: cita.servicio.especialidad.nombre,
    },
  };

  // Extract 24-hour time (HH:mm) directly from horaInicio for form pre-fill
  const resolveTime24h = (horaInicio: string | null | undefined): string | undefined => {
    if (!horaInicio) return undefined;
    if (horaInicio.includes('T')) return horaInicio.split('T')[1].slice(0, 5);
    const match = horaInicio.match(/^(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    return undefined;
  };

  let clientName = "";
  if (userRole === "DOCTOR") {
    clientName = `${cita.paciente.nombre} ${cita.paciente.apellido}`;
  } else if (userRole === "PATIENT") {
    clientName = `${cita.doctor.nombre} ${cita.doctor.apellido}`;
  }

  let clientImage = "";
  if (userRole === "DOCTOR") {
    clientImage = cita.paciente.usuario.fotoPerfil || "";
  } else if (userRole === "PATIENT") {
    clientImage = cita.doctor.usuario.fotoPerfil || "";
  }

  return {
    id: cita.id.toString(),
    doctorId,
    serviceData,
    clientName,
    date: fechaInicio,
    clientImage,
    service: cita.servicio.nombre,
    startTime,
    endTime,
    isVirtual: isVirtualModality(cita.modalidad),
    status: mapCitaEstadoToAppointmentStatus(cita.estado),
    serviceId: (cita.servicioId ?? cita.servicio?.id)?.toString(),
    time24h: resolveTime24h(cita.horaInicio),
    reason: cita.motivoConsulta || undefined,
    numberOfSessions: cita.numPacientes || 1,
    insuranceProviderId: cita.seguro?.id?.toString() || undefined,
    useInsurance: cita.seguro !== null,
  };
};

/**
 * Convierte un array de CitaDetalle al formato de Appointment[]
 */
export const mapCitasToAppointments = (citas: CitaDetalle[], userRole: string): Appointment[] => {
  return citas.map((cita) => mapCitaDetalleToAppointment(cita, userRole));
};
