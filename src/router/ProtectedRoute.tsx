import React from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import type { AppUserRole } from "@/services/auth/auth.types";

interface ProtectedRouteProps {
  children: React.ReactNode;

  doctor?: boolean;
  patient?: boolean;
  center?: boolean;
}

const roleMap: Record<AppUserRole, keyof ProtectedRouteProps> = {
  DOCTOR: "doctor",
  PATIENT: "patient",
  CENTER: "center",
  ADMINISTRATOR: "center", // Por defecto, administradores tienen acceso a centro
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  doctor,
  patient,
  center,
}) => {
  const { user } = useAppStore((s) => s);

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // El user.rol ya viene en formato de aplicación (DOCTOR, PATIENT, CENTER)
  // gracias a getUserAppRole en normalizeLoginResponse
  const appRole = user.rol as AppUserRole;

  // Verificar que el rol sea válido
  if (!roleMap[appRole]) {
    console.warn("Invalid user role:", user.rol);
    return <Navigate to="/dashboard" replace />;
  }

  const roleKey = roleMap[appRole];

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

