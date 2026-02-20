import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
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
}

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  type: Tab;
  onConnect: (id: string) => void;
  onReject: (id: string) => void;
  onWithdraw: (id: string) => void;
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

  const nameRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const [isNameTruncated, setIsNameTruncated] = useState(false);
  const [isSubtitleTruncated, setIsSubtitleTruncated] = useState(false);

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

  const renderName = () => {
    const nameElement = (
      <p ref={nameRef} className="font-semibold text-foreground truncate">
        {request.name}
      </p>
    );

    if (isNameTruncated) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{nameElement}</TooltipTrigger>
            <TooltipContent>
              <p>{request.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return nameElement;
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
            <TooltipContent>
              <p>{request.subtitle}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return subtitleElement;
  };

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
        <div className="flex-1 min-w-0">
          {renderName()}
          {renderSubtitle()}
          <p className="text-sm text-muted-foreground">{request.date}</p>
        </div>
      </div>
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
        {type === "recibidas" ? (
          <>
            <MCButton
              variant="outline"
              size="sm"
              className={cn(
                "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                isMobile && "w-full",
              )}
              onClick={() => onConnect(request.id)}
            >
              {t("requests.connect")}
            </MCButton>
            <MCButton
              variant="outline"
              size="sm"
              className={isMobile ? "w-full" : ""}
              onClick={() => onReject(request.id)}
            >
              {t("requests.reject")}
            </MCButton>
          </>
        ) : (
          <MCButton
            variant="outlineDelete"
            size="sm"
            className={isMobile ? "w-full" : ""}
            onClick={() => onWithdraw(request.id)}
          >
            {t("requests.withdraw")}
          </MCButton>
        )}
      </div>
    </div>
  );
};
