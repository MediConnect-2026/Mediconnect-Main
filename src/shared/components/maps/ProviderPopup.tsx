import { type Provider } from "@/data/providers";
import DoctorPopup from "./DoctorPopup";
import CenterPopup from "./CenterPopup";

type Props = {
  provider: Provider;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function ProviderPopup({ provider, isSelected, onSelect }: Props) {
  // Cerrar el popup usando el DOM
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    const popup = (e.target as HTMLElement).closest(".mapboxgl-popup") as any;
    popup?._popup?.remove?.();
  };

  return (
    <div
      className="popup-card relative w-72 rounded-xl p-4 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {provider.type === "doctor" ? (
        <DoctorPopup provider={provider} />
      ) : (
        <CenterPopup provider={provider} />
      )}
      <div className="p-2">
        <button
          onClick={() => onSelect(provider.id)}
          className={`w-full py-1 rounded text-sm text-white mt-2
            ${isSelected ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
          disabled={isSelected}
        >
          {isSelected ? "Seleccionado" : "Seleccionar"}
        </button>
      </div>
    </div>
  );
}

export default ProviderPopup;
