import React, { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/shared/ui/sonner";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function MCToast() {
  const toastState = useGlobalUIStore((state) => state.toast);
  const clearToast = useGlobalUIStore((state) => state.clearToast);

  useEffect(() => {
    // Solo mostrar el toast si está abierto y tiene un mensaje
    if (toastState.open && toastState.message) {
      // Mostrar el toast según el tipo
      switch (toastState.type) {
        case "success":
          toast.success(toastState.message);
          break;
        case "error":
          toast.error(toastState.message);
          break;
        case "warning":
          toast.warning(toastState.message);
          break;
        case "info":
          toast.info(toastState.message);
          break;
        default:
          toast(toastState.message);
      }

      // Limpiar el toast del store después de mostrarlo
      clearToast();
    }
  }, [toastState, clearToast]);

  return <Toaster position="top-center" />;
}

export default MCToast;
