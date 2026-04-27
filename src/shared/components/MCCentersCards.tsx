import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Star, Phone } from "lucide-react";
import MCButton from "./forms/MCButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { formatPhone } from "@/utils/phoneFormat";
import ToogleConfirmConnection from "@/features/request/components/ToogleConfirmConnection";

// Shows a tooltip ONLY when the text is actually truncated/clamped
function TruncatedText({
  text,
  className,
  maxLines = 2,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  maxLines?: 1 | 2;
  as?: "span" | "p" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  const clampClass = maxLines === 1 ? "line-clamp-1" : "line-clamp-2";

  const content = (
    <Tag
      ref={ref as React.RefObject<any>}
      className={`${clampClass} ${className ?? ""}`}
    >
      {text}
    </Tag>
  );

  if (!isTruncated) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-[240px] whitespace-normal">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MCCenterCardProps {
  id?: string | number;
  urlImage: string;
  name: string;
  type: string;
  description?: string;
  rating: number;
  reviewCount?: number;
  phone?: string;
  connectionStatus?: "connected" | "not_connected" | "pending";
  onDetails?: () => void;
  onToggleConnection?: () => void;
  isConnectionSubmitting?: boolean;
}

const MCCentersCards = ({
  id,
  urlImage,
  name,
  type,
  description,
  rating,
  reviewCount,
  phone,
  connectionStatus = "not_connected",
  onDetails,
  onToggleConnection,
  isConnectionSubmitting = false,
}: MCCenterCardProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const userRole = useAppStore((state) => state.user?.rol);

  let connectBtnText = t("clinicCard.connect");
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";

  if (connectionStatus === "connected") {
    connectBtnText = t("clinicCard.connected");
    connectVariant = "primary";
  } else if (connectionStatus === "pending") {
    connectBtnText = t("clinicCard.pending");
    connectBtnDisabled = true;
  }

  const canToggleConnection = typeof onToggleConnection === "function";

  return (
    <Card className="rounded-3xl bg-transparent border border-primary/10 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative overflow-hidden rounded-3xl border border-primary/5">
        <img
          src={urlImage}
          alt={name}
          className={`w-full object-cover transition-transform duration-500 hover:scale-110 ${
            isMobile ? "h-40" : "h-48"
          }`}
        />
      </div>

      <CardContent
        className={`flex flex-col flex-1 ${isMobile ? "pt-3 pb-2" : "pt-4 pb-2"}`}
      >
        <TruncatedText
          text={name}
          maxLines={1}
          as="h3"
          className={`font-semibold text-primary ${isMobile ? "text-base" : "text-lg"}`}
        />
        <TruncatedText
          text={type}
          maxLines={2}
          as="p"
          className={`text-muted-foreground mb-1 ${isMobile ? "text-xs min-h-[20px]" : "text-sm min-h-[24px]"}`}
        />
        <p
          className={`text-muted-foreground mb-3 line-clamp-2 ${isMobile ? "text-xs min-h-[32px]" : "text-sm min-h-[36px]"}`}
        >
          {description || "-"}
        </p>

        <div
          className={`flex w-full justify-between text-primary ${isMobile ? "px-0 text-xs mb-3 flex-wrap gap-1" : "px-1 text-sm mb-4"}`}
        >
          <div className="flex items-center gap-1">
            <Star
              size={isMobile ? 14 : 16}
              fill="#F7B500"
              className="text-[#F7B500]"
            />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">
              {reviewCount ? `(${reviewCount} ${t("clinicCard.reviews")})` : ""}
            </span>
          </div>
          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}
          {phone && (
            <div className="flex items-center gap-1">
              <Phone size={isMobile ? 14 : 16} className="text-secondary" />
              <span>{formatPhone(phone)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          {userRole === "DOCTOR" ? (
            <>
              <ToogleConfirmConnection
                status={connectionStatus}
                id={typeof id === "string" ? parseInt(id, 10) || 0 : (id ?? 0)}
                onConfirm={() => onToggleConnection?.()}
                isSubmitting={isConnectionSubmitting}
              >
                <MCButton
                  variant={connectVariant}
                  size={isMobile ? "xs" : "sm"}
                  className={cn(
                    "flex-1 w-full",
                    isMobile && "text-xs px-2",
                    connectionStatus === "connected" &&
                      "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                    connectionStatus === "not_connected" &&
                      "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                    connectionStatus === "pending" &&
                      "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed",
                  )}
                  disabled={
                    connectBtnDisabled ||
                    !canToggleConnection ||
                    isConnectionSubmitting
                  }
                >
                  {connectBtnText}
                </MCButton>
              </ToogleConfirmConnection>
              <MCButton
                className="flex-1 rounded-full"
                variant="primary"
                onClick={onDetails}
                size={isMobile ? "xs" : "sm"}
              >
                {t("clinicCard.viewProfile")}
              </MCButton>
            </>
          ) : (
            <MCButton
              className="col-span-2 rounded-full"
              variant="primary"
              onClick={onDetails}
              size={isMobile ? "xs" : "sm"}
            >
              {t("clinicCard.viewProfile")}
            </MCButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MCCentersCards;
