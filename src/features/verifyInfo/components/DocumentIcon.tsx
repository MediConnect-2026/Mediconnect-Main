import { CircleCheck, Loader, CircleSlash } from "lucide-react";
import { STATUS, type VerificationStatus } from "./Verificationconstants";

const ICON_CONFIG: Record<
  VerificationStatus,
  { Icon: typeof CircleCheck; iconClass: string; bgClass: string }
> = {
  APPROVED: {
    Icon: CircleCheck,
    iconClass: "text-[#2E7D32]",
    bgClass: "bg-[#2E7D32]/15",
  },
  PENDING: {
    Icon: Loader,
    iconClass: "text-[#C77A1F] animate-spin",
    bgClass: "bg-[#C77A1F]/15",
  },
  REJECTED: {
    Icon: CircleSlash,
    iconClass: "text-[#C62828]",
    bgClass: "bg-[#C62828]/15",
  },
};

interface DocumentIconProps {
  status: VerificationStatus;
}

export default function DocumentIcon({ status }: DocumentIconProps) {
  const { Icon, bgClass, iconClass } = ICON_CONFIG[status];
  return (
    <div
      className={`flex items-center justify-center w-14 h-14 rounded-full ${bgClass}`}
    >
      <Icon className={`w-7 h-7 ${iconClass}`} />
    </div>
  );
}
