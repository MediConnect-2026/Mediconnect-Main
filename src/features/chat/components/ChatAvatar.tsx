import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 md:h-10 md:w-10",
  md: "h-10 w-10 md:h-12 md:w-12",
  lg: "h-12 w-12 md:h-14 md:w-14",
};

const mcUserAvatarSizes = {
  sm: { mobile: 32, desktop: 40 },
  md: { mobile: 40, desktop: 48 },
  lg: { mobile: 48, desktop: 56 },
};

const onlineIndicatorSizes = {
  sm: "w-2 h-2 md:w-2.5 md:h-2.5",
  md: "w-2.5 h-2.5 md:w-3 md:h-3",
  lg: "w-3 h-3 md:w-3.5 md:h-3.5",
};

export function ChatAvatar({ name, avatar, size = "md", isOnline = false }: ChatAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {/* Avatar */}
      {!avatar ? (
        <MCUserAvatar
          name={name}
          square={false}
          size={mcUserAvatarSizes[size].desktop}
          className={`${sizeClasses[size]} object-cover transition-transform duration-500 hover:scale-110`}
        />
      ) : (
        <Avatar className={`${sizeClasses[size]} bg-muted`}>
          <AvatarImage src={avatar} alt={name} className="object-cover" />
          <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs md:text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Indicador de online */}
      {isOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background bg-green-500",
            onlineIndicatorSizes[size]
          )}
          aria-label="En línea"
        />
      )}
    </div>
  );
}
