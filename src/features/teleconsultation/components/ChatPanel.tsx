import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";
import doctorAvatar from "@/assets/doctor-avatar.jpg";

interface Message {
  id: number;
  text: string;
  sender: "user" | "doctor";
  time: string;
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      time: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-panel">
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[300px]">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No hay mensajes aún
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fade-in ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={doctorAvatar} />
                  <AvatarFallback>CR</AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">{message.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-container">
        <Avatar className="w-10 h-10">
          <AvatarImage src={doctorAvatar} />
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="pr-12 rounded-full bg-muted border-0"
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary/10 transition-colors"
          >
            <Send className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};
