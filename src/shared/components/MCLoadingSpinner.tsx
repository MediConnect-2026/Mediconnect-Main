import { Loader2 } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function MCLoadingSpinner() {
  const isLoading = useGlobalUIStore((state) => state.isloading);

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Loader2 />
    </div>
  );
}

export default MCLoadingSpinner;
