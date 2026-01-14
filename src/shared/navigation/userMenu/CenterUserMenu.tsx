import React from "react";
import BaseUserMenu from "./BaseUserMenu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/shared/animate-ui/components/radix/dropdown-menu";
import {
  User,
  Pencil,
  FileCheck,
  Settings,
  HelpCircle,
  Badge,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const isMac =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const cmdOrCtrl = isMac ? "⌘" : "Ctrl";

function CenterUserMenu() {
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
          <FileCheck className="w-4 h-4 mr-2" />
          Documentos de verificación
          <div className="ml-auto flex items-center gap-1">
            <Badge className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
          </div>
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
          <HelpCircle className="w-4 h-4 mr-2" />
          Centro de Ayuda
          {!isMobile && (
            <DropdownMenuShortcut>{cmdOrCtrl}+H</DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="bg-primary/15" />
    </>
  );

  return <BaseUserMenu roleText="Centro Médico">{menuContent}</BaseUserMenu>;
}

export default CenterUserMenu;
