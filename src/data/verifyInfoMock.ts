import type {
  DoctorPersonalInfo,
  CenterPersonalInfo,
} from "@/schema/verifyInfo.schema";

export type VerifyInfoDoctorData = DoctorPersonalInfo;
export type VerifyInfoCenterData = CenterPersonalInfo;

// Sin mock data
export const mockDoctorData: DoctorPersonalInfo | null = null;
export const mockCenterData: CenterPersonalInfo | null = null;
