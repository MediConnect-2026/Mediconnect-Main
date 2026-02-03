import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";

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
    <div className="flex flex-col h-full bg-background rounded-xl border border-primary/15 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-primary/10">
        <h3 className="font-semibold">Chat de consulta</h3>
        <p className="text-sm text-muted-foreground">Dr. Cristiano Ronaldo</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No hay mensajes aún
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
                  <AvatarFallback>CR</AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
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
      <div className="p-4 border-t border-primary/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="pr-16 rounded-full bg-muted border border-primary/15 focus-visible:ring-1"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
