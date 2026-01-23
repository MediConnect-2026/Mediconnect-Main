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
    <div onClick={(e) => e.stopPropagation()}>
      {provider.type === "doctor" ? (
        <DoctorPopup provider={provider} />
      ) : (
        <CenterPopup provider={provider} />
      )}
    </div>
  );
}

export default ProviderPopup;
