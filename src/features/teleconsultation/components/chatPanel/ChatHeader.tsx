import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface ChatHeaderProps {
  isTyping: boolean;
  isOnline: boolean;
}

export const ChatHeader = ({ isTyping, isOnline }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-primary/10">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">Dr. Cristiano Ronaldo</h3>
          <p className="text-xs text-muted-foreground">
            {isTyping
              ? "escribiendo..."
              : isOnline
                ? "en línea"
                : "desconectado"}
          </p>
        </div>
      </div>
    </div>
  );
};
