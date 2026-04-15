export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  evaluationType: string;
  date: string;
  time: string;
  description?: string;
  appointmentType: "virtual" | "in_person";
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
  location: {
    latitude: number;
    longitude: number;
  };
  Service?: string;
  Reason?: string;
  price?: number;
  numberOfPatients?: number;
  patientName?: string;
  history?: {
    id?: string;
    date: string;
    time: string;
    address: string;
    service: string;
    medicalPrescription?: {
      diagnosis: string;
      observations: string;
      documents?: {
        name: string;
        url: string;
      }[];
    };
  }[];
}

export const mockAppointments: Appointment[] = [];
