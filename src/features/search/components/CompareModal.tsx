import { MCModalBase } from "@/shared/components/MCModalBase";
import CompareDoctorCards from "./CompareDoctorCards";
import type { Provider } from "@/data/providers";

interface CompareModalProps {
  selectedProviders: Provider[];
  children: React.ReactNode | React.ComponentType;
}

function CompareModal({ selectedProviders, children }: CompareModalProps) {
  function modalTrigger(children: React.ReactNode | React.ComponentType) {
    return <>{children}</>;
  }

  return (
    <MCModalBase
      id="23423432"
      title="Comparar proveedores"
      trigger={modalTrigger(children)}
      size="lg"
      triggerClassName="w-fit rounded-full"
    >
      <CompareDoctorCards />
    </MCModalBase>
  );
}

export default CompareModal;
