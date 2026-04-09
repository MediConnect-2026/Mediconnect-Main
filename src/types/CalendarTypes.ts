
export type AppointmentStatus =
  | "scheduled"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorAvatarUrl?: string;
  doctorSpecialty: string;
  patientId: string;
  patientAvatarUrl?: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  type: "consulta" | "revision" | "urgencia" | "seguimiento";
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  modality?: any | "presencial" | "virtual";
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
  service?: string;
  price?: number;
  numberOfSessions?: number;
}

export type CalendarView = "month" | "week" | "day" | "list";

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  selectedAppointment: Appointment | null;
  view: CalendarView;
}
