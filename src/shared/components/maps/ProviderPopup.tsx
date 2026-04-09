import React from "react";
import { type Provider } from "@/data/providers";
import DoctorPopup from "./DoctorPopup";
import CenterPopup from "./CenterPopup";

type ProviderPopupProps = {
  provider: Provider;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onScheduleAppointment?: (providerId: string) => void;
  navigateFn?: (path: string) => void;
  userRole?: string | null;
  isMobile?: boolean;
  onContact?: (providerId: string) => void;
  isStartingConversation?: boolean;
};

const ProviderPopup: React.FC<ProviderPopupProps> = ({
  provider,
  isSelected,
  onSelect,
  onScheduleAppointment,
  onContact,
  navigateFn,
  userRole,
  isMobile,
  isStartingConversation = false,
}) => {
  if (provider.type === "doctor") {
    return (
      <DoctorPopup
        provider={provider}
        isConnected={isSelected}
        onConnect={onSelect}
        onScheduleAppointment={onScheduleAppointment}
        navigateFn={navigateFn}
        userRole={userRole}
        isMobile={isMobile}
        onContact={onContact}
        isContactLoading={isStartingConversation}
      />
    );
  }

  return (
    <CenterPopup
      provider={provider}
      isConnected={isSelected}
      onConnect={onSelect}
      navigateFn={navigateFn}
      userRole={userRole}
      isMobile={isMobile}
    />
  );
};

export default ProviderPopup;
