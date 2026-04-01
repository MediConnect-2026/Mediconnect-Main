export type StaffStatus = "active" | "inactive";

export interface CenterStaffMember {
  id: string;
  name: string;
  specialty: string;
  specialtyIds: string[];
  rating: number;
  yearsOfExperience: number;
  languages: string[];
  insuranceAccepted: string[];
  isFavorite: boolean;
  urlImage: string;
  joinDate: string;
  totalAppointments: number;
  status: StaffStatus;
}