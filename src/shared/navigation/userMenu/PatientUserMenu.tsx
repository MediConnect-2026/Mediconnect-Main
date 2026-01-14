import React from "react";
import BaseUserMenu from "./BaseUserMenu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/shared/animate-ui/components/radix/dropdown-menu";
import { User, Pencil, Settings, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const isMac =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const cmdOrCtrl = isMac ? "⌘" : "Ctrl";

function PatientUserMenu() {
  const { t } = useTranslation("dashboard");
  const isMobile = useIsMobile();

  const menuContent = (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <User className="w-4 h-4 mr-2" />
          {t("userMenu.viewProfile")}
          {!isMobile && (
            <DropdownMenuShortcut>⇧{cmdOrCtrl}+P</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className="w-4 h-4 mr-2" />
          {t("userMenu.editProfile")}
          {!isMobile && (
            <DropdownMenuShortcut>{cmdOrCtrl}+E</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="bg-primary/15" />

      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          {t("userMenu.settings")}
          {!isMobile && (
            <DropdownMenuShortcut>{cmdOrCtrl}+S</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Shield className="w-4 h-4 mr-2" />
          {t("userMenu.privacy")}
          {!isMobile && (
            <DropdownMenuShortcut>{cmdOrCtrl}+P</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="bg-primary/15" />
    </>
  );

  return <BaseUserMenu roleText="Paciente">{menuContent}</BaseUserMenu>;
}

export default PatientUserMenu;
