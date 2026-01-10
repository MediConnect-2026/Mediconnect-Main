import { Spinner } from "@/shared/ui/spinner";
import { useAppStore } from "@/stores/useAppStore";

function MCLoadingSpinner() {
  const isloading = useAppStore((state) => state.isloading);

  if (!isloading) return null;

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
      <Spinner />
    </div>
  );
}

export default MCLoadingSpinner;
