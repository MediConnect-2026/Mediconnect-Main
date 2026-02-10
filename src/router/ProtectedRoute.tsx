import React from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import type { UserRole } from "@/stores/useAuthSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;

  doctor?: boolean;
  patient?: boolean;
  center?: boolean;
}

const roleMap: Record<UserRole, keyof ProtectedRouteProps> = {
  DOCTOR: "doctor",
  PATIENT: "patient",
  CENTER: "center",
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  doctor,
  patient,
  center,
}) => {
  const { user } = useAppStore((s) => s);

  const roleKey = roleMap[user!.role];

  const hasAccess =
    (roleKey === "doctor" && doctor) ||
    (roleKey === "patient" && patient) ||
    (roleKey === "center" && center);

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
