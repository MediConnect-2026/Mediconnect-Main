import React from "react";
import { type Provider } from "@/data/providers";
import DoctorPopup from "./DoctorPopup";
import CenterPopup from "./CenterPopup";

type ProviderPopupProps = {
  provider: Provider;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  navigateFn?: (path: string) => void;
};

const ProviderPopup: React.FC<ProviderPopupProps> = ({
  provider,
  isSelected,
  onSelect,
  navigateFn,
}) => {
  if (provider.type === "doctor") {
    return (
      <DoctorPopup
        provider={provider}
        isConnected={isSelected}
        onConnect={onSelect}
        navigateFn={navigateFn}
      />
    );
  }

  return (
    <CenterPopup
      provider={provider}
      isConnected={isSelected}
      onConnect={onSelect}
      navigateFn={navigateFn}
    />
  );
};

export default ProviderPopup;
