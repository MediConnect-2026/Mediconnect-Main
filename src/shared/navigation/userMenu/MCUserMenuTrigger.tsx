import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ChevronDown } from "lucide-react";
import { DropdownMenuTrigger } from "@/shared/animate-ui/components/radix/dropdown-menu";
import { MCUserAvatar } from "./MCUserAvatar";

interface UserData {
  userId: number;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  roleLabel: string;
}

interface MCUserMenuTriggerProps {
  userData: UserData;
  open: boolean;
}

export function MCUserMenuTrigger({ userData, open }: MCUserMenuTriggerProps) {
  return (
    <DropdownMenuTrigger
      asChild
      className="outline-none border-none shadow-none ring-0 focus:ring-0 "
    >
      <Button
        className={`flex items-center justify-center gap-3 rounded-full bg-transparent hover:bg-accent/80 outline-none border-none shadow-none ring-0 focus:ring-0 h-fit transition-colors w-full overflow-hidden ${
          open ? "bg-primary rounded-full text-primary" : ""
        }`}
      >
        {/* Avatar: flex-shrink-0 → nunca se encoge sin importar el largo del nombre */}
        <div className="flex-shrink-0">
          {userData.avatar ? (
            <Avatar className="h-[54px] w-[54px] rounded-full shadow-lg transition-all">
              <AvatarImage
                src={userData.avatar}
                alt={userData.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl">
                {userData.initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <MCUserAvatar name={userData.name} size={54} square={false} />
          )}
        </div>

        {/* Contenedor texto + chevron: min-w-0 para que truncate funcione en flex */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Textos: min-w-0 + overflow-hidden es la clave del truncado en flex */}
          <div className="flex flex-col items-start leading-tight text-left min-w-0 overflow-hidden">
            <span
              className={`text-base font-semibold w-full truncate max-w-[160px] ${
                !open ? "text-primary" : "text-background"
              }`}
              title={userData.name}
            >
              {userData.name}
            </span>
            <span
              className={`text-sm font-normal w-full truncate ${
                !open ? "text-primary" : "text-background"
              }`}
              title={userData.roleLabel}
            >
              {userData.roleLabel}
            </span>
          </div>

          {/* Chevron: flex-shrink-0 → nunca se comprime */}
          <div className="flex-shrink-0 flex flex-col h-full items-start justify-start">
            <ChevronDown
              className={`w-6 h-6 mt-0.5 stroke-2.5 transition-transform duration-200 ${
                open ? "rotate-180 text-background" : "text-primary"
              }`}
            />
          </div>
        </div>
      </Button>
    </DropdownMenuTrigger>
  );
}

export default MCUserMenuTrigger;
