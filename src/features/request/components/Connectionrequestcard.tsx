import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import MCButton from "@/shared/components/forms/MCButton";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { ROUTES } from "@/router/routes";
import { Textarea } from "@/shared/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";

type Tab = "recibidas" | "enviadas";

interface ConnectionRequest {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  avatar: string;
  profileId: string;
  profileType: "doctor" | "center";
  status: "Pendiente" | "Aceptada" | "Rechazada";
  rejectionReason?: string;
  issuerName?: string;
  attendedAt?: string;
}

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  type: Tab;
  onConnect: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onWithdraw: (id: string) => Promise<void>;
}

export const ConnectionRequestCard = ({
  request,
  type,
  onConnect,
  onReject,
  onWithdraw,
}: ConnectionRequestCardProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const nameRef = useRef<HTMLButtonElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const [isNameTruncated, setIsNameTruncated] = useState(false);
  const [isSubtitleTruncated, setIsSubtitleTruncated] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRejectDetailModalOpen, setIsRejectDetailModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmittingAccept, setIsSubmittingAccept] = useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const isPending = request.status === "Pendiente";
  const isAccepted = request.status === "Aceptada";
  const isRejected = request.status === "Rechazada";

  useEffect(() => {
    const checkTruncation = () => {
      if (nameRef.current) {
        setIsNameTruncated(
          nameRef.current.scrollWidth > nameRef.current.clientWidth,
        );
      }
      if (subtitleRef.current) {
        setIsSubtitleTruncated(
          subtitleRef.current.scrollWidth > subtitleRef.current.clientWidth,
        );
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [request.name, request.subtitle]);

  const handleOpenProfile = () => {
    if (!request.profileId) {
      return;
    }

    const profileRoute =
      request.profileType === "doctor"
        ? ROUTES.DOCTOR.DOCTOR_PROFILE_PUBLIC.replace(
            ":doctorId",
            request.profileId,
          )
        : ROUTES.CENTER.CENTER_PROFILE_PUBLIC.replace(
            ":centerId",
            request.profileId,
          );

    navigate(profileRoute);
  };

  const handleAcceptRequest = async () => {
    setIsSubmittingAccept(true);
    try {
      await onConnect(request.id);
      setIsAcceptModalOpen(false);
    } finally {
      setIsSubmittingAccept(false);
    }
  };

  const handleRejectRequest = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      return;
    }

    setIsSubmittingReject(true);
    try {
      await onReject(request.id, reason);
      setRejectReason("");
      setIsRejectModalOpen(false);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleWithdrawRequest = async () => {
    setIsSubmittingWithdraw(true);
    try {
      await onWithdraw(request.id);
      setIsWithdrawModalOpen(false);
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Badge shown inline next to the name for non-pending statuses
  const statusBadge = !isPending ? (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0",
        isAccepted
          ? "bg-secondary/20 text-secondary border border-secondary/30"
          : "bg-destructive/10 text-destructive border border-destructive/30",
      )}
    >
      {isAccepted ? t("requests.statusAccepted") : t("requests.statusRejected")}
    </Badge>
  ) : null;

  const renderName = () => {
    const nameElement = (
      <button
        type="button"
        ref={nameRef}
        className="font-semibold text-foreground truncate text-left cursor-pointer hover:underline"
        onClick={handleOpenProfile}
        style={{ maxWidth: isMobile ? 160 : 240 }} // Puedes ajustar el ancho máximo si lo deseas
      >
        {request.name}
      </button>
    );

    if (isNameTruncated) {
      return (
        <div className="flex items-center gap-2 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{nameElement}</TooltipTrigger>
              <TooltipContent>{request.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {statusBadge}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 min-w-0">
        {nameElement}
        {statusBadge}
      </div>
    );
  };

  const renderSubtitle = () => {
    const subtitleElement = (
      <p ref={subtitleRef} className="text-sm text-muted-foreground truncate">
        {request.subtitle}
      </p>
    );

    if (isSubtitleTruncated) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{subtitleElement}</TooltipTrigger>
            <TooltipContent>{request.subtitle}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return subtitleElement;
  };

  const renderStatusActions = () => {
    if (isPending) {
      if (type === "recibidas") {
        return (
          <>
            <MCButton
              variant="outline"
              size="sm"
              className={cn(
                "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                isMobile && "w-full flex-1",
              )}
              onClick={() => setIsAcceptModalOpen(true)}
            >
              {t("requests.connect")}
            </MCButton>
            <MCButton
              variant="outline"
              size="sm"
              className={isMobile ? "w-full" : ""}
              onClick={() => setIsRejectModalOpen(true)}
            >
              {t("requests.reject")}
            </MCButton>
          </>
        );
      }

      return (
        <MCButton
          variant="outlineDelete"
          size="sm"
          className={isMobile ? "w-full" : ""}
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          {t("requests.withdraw")}
        </MCButton>
      );
    }

    // Non-pending: badge is now shown next to the name.
    // Only render the "view detail" button here for rejected requests.
    if (isRejected) {
      return (
        <MCButton
          variant="outline"
          size="sm"
          className={isMobile ? "w-full" : ""}
          onClick={() => setIsRejectDetailModalOpen(true)}
        >
          {t("requests.viewDetail")}
        </MCButton>
      );
    }

    return null;
  };

  const actions = renderStatusActions();

  return (
    <div
      className={cn(
        "flex gap-4 py-5 w-full",
        isMobile ? "flex-col" : "flex-row items-center",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-6 flex-1 min-w-0",
          isMobile && "w-full",
        )}
      >
        <button
          type="button"
          onClick={handleOpenProfile}
          className="cursor-pointer rounded-2xl"
        >
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            {request.avatar && request.avatar !== "null" ? (
              <AvatarImage
                src={request.avatar}
                alt={request.name}
                className="w-full h-full object-cover rounded-2xl border border-primary/5 transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-2xl border border-primary/5">
                <MCUserAvatar
                  name={request.name}
                  square
                  size={isMobile ? 64 : 80}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </Avatar>
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          {renderName()}
          {renderSubtitle()}
          <p className="text-sm text-muted-foreground">{request.date}</p>
        </div>
      </div>

      {actions && (
        <div
          className={cn(
            "flex flex-shrink-0",
            type === "recibidas"
              ? isMobile
                ? "flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-3"
                : "flex-row gap-3"
              : "gap-3",
          )}
        >
          {actions}
        </div>
      )}

      <MCModalBase
        id={`accept-request-${request.id}`}
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        title={t("requests.acceptModalTitle")}
        description={t("requests.acceptModalDescription")}
        variant="decide"
        size="smWide"
        onConfirm={handleAcceptRequest}
        onSecondary={() => setIsAcceptModalOpen(false)}
        confirmText={
          isSubmittingAccept
            ? t("requests.sending")
            : t("requests.acceptConfirm")
        }
        secondaryText={t("requests.cancel")}
        disabledConfirm={isSubmittingAccept}
      >
        <></>
      </MCModalBase>

      <MCModalBase
        id={`reject-request-${request.id}`}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={t("requests.rejectModalTitle")}
        variant="warning"
        size="smWide"
        onConfirm={handleRejectRequest}
        onSecondary={() => setIsRejectModalOpen(false)}
        confirmText={
          isSubmittingReject
            ? t("requests.sending")
            : t("requests.rejectConfirm")
        }
        secondaryText={t("requests.cancel")}
        disabledConfirm={isSubmittingReject || rejectReason.trim().length === 0}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("requests.rejectReasonPrompt")}
          </p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            maxLength={255}
            placeholder={t("requests.rejectReasonPlaceholder")}
            disabled={isSubmittingReject}
          />
          <p className="text-xs text-muted-foreground text-right">
            {rejectReason.trim().length}/255
          </p>
        </div>
      </MCModalBase>

      <MCModalBase
        id={`reject-detail-request-${request.id}`}
        isOpen={isRejectDetailModalOpen}
        onClose={() => setIsRejectDetailModalOpen(false)}
        title={t("requests.rejectDetailTitle")}
        variant="decide"
        size="smWide"
        onSecondary={() => setIsRejectDetailModalOpen(false)}
        secondaryText={t("requests.close")}
        showConfirm={false}
      >
        <div className="flex flex-row items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("requests.rejectReasonLabel")}
            </p>
            <p className="text-sm font-medium text-foreground break-words">
              {request.rejectionReason || t("requests.noReason")}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              {t("requests.issuerLabel")}
            </p>
            <p className="text-sm font-medium text-foreground">
              {request.issuerName || t("requests.unknown")}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              {t("requests.attendedAtLabel")}
            </p>
            <p className="text-sm font-medium text-foreground">
              {request.attendedAt || t("requests.notAvailable")}
            </p>
          </div>
        </div>
      </MCModalBase>

      <MCModalBase
        id={`withdraw-request-${request.id}`}
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title={t("requests.withdrawModalTitle")}
        description={t("requests.withdrawModalDescription")}
        variant="warning"
        size="smWide"
        onConfirm={handleWithdrawRequest}
        onSecondary={() => setIsWithdrawModalOpen(false)}
        confirmText={
          isSubmittingWithdraw
            ? t("requests.sending")
            : t("requests.withdrawConfirm")
        }
        secondaryText={t("requests.cancel")}
        disabledConfirm={isSubmittingWithdraw}
      >
        <></>
      </MCModalBase>
    </div>
  );
};
