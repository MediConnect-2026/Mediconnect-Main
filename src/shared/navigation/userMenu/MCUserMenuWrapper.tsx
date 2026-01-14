import React from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { UserRole } from "@/stores/useAuthSlice";
import PatientUserMenu from "./PatientUserMenu";
import DoctorUserMenu from "./DoctorUserMenu";
import CenterUserMenu from "./CenterUserMenu";

function MCUserMenuWrapper() {
  const user = useAppStore((state) => state.user);
  const userRole: UserRole = user?.role || "PATIENT";

  switch (userRole) {
    case "PATIENT":
      return <PatientUserMenu />;
    case "DOCTOR":
      return <DoctorUserMenu />;
    case "CENTER":
      return <CenterUserMenu />;
    default:
      return <PatientUserMenu />;
  }
}

export default MCUserMenuWrapper;
