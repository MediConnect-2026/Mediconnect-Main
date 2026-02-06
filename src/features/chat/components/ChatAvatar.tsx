import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar"; // Agrega este import

interface ChatAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export function ChatAvatar({ name, avatar, size = "md" }: ChatAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Si no hay avatar, usa MCUserAvatar
  if (!avatar) {
    return (
      <MCUserAvatar
        name={name}
        square={false}
        size={size === "sm" ? 40 : size === "md" ? 48 : 56}
        className={`${sizeClasses[size]} object-cover transition-transform duration-500 hover:scale-110`}
      />
    );
  }

  return (
    <Avatar className={`${sizeClasses[size]} bg-mute`}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
