import { MCModalBase } from "@/shared/components/MCModalBase";
import CompareDoctorCards from "./CompareDoctorCards";
import type { Provider } from "@/data/providers";
import { useTranslation } from "react-i18next"; // <-- Agrega esto

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
  const { t } = useTranslation("patient"); // <-- Agrega esto

  function modalTrigger(children: React.ReactNode | React.ComponentType) {
    return <>{children}</>;
  }

  return (
    <MCModalBase
      id="compare-modal"
      title={t("compareModal.title")} // <-- Traducción aquí
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
