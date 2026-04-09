import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "@/shared/ui/sonner";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function MCToast() {
  const toastState = useGlobalUIStore((state) => state.toast);
  const clearToast = useGlobalUIStore((state) => state.clearToast);
  const lastToastRef = useRef<string>("");

  useEffect(() => {
    // Solo mostrar el toast si está abierto, tiene un mensaje, y es diferente al último mostrado
    if (toastState.open && toastState.message) {
      const toastKey = `${toastState.type}-${toastState.message}`;
      
      // Evitar mostrar el mismo toast múltiples veces
      if (toastKey === lastToastRef.current) {
        return;
      }
      
      lastToastRef.current = toastKey;
      
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
      
      // Resetear la referencia después de un pequeño delay
      setTimeout(() => {
        lastToastRef.current = "";
      }, 100);
    }
  }, [toastState.open, toastState.message, toastState.type, clearToast]);

  return <Toaster position="bottom-right" />;
}

export default MCToast;
