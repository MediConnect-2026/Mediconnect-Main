import { MCModalBase } from "@/shared/components/MCModalBase";
import CompareDoctorCards from "./CompareDoctorCards";
import type { Provider } from "@/data/providers";

interface CompareModalProps {
  selectedProviders: Provider[];
  children: React.ReactNode | React.ComponentType;
  onRemoveProvider?: (id: string) => void;
}

function CompareModal({
  selectedProviders,
  children,
  onRemoveProvider,
}: CompareModalProps) {
  function modalTrigger(children: React.ReactNode | React.ComponentType) {
    return <>{children}</>;
  }

  return (
    <MCModalBase
      id="compare-modal"
      title="Comparar proveedores"
      trigger={modalTrigger(children)}
      triggerClassName="w-fit rounded-full"
      size="wider"
      actionOne={true}
    >
      <CompareDoctorCards
        selectedProviders={selectedProviders}
        onRemoveProvider={onRemoveProvider}
      />
    </MCModalBase>
  );
}

export default CompareModal;
