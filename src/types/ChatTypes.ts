export interface Message {
  id: string;
  type: "text" | "image" | "file" | "voice";
  content: string; // texto, url de imagen, url de archivo, etc.
  sender: "user" | "doctor";
  time: string; // hora en formato string
  status?: "sent" | "delivered" | "read";
  caption?: string; // para imágenes o archivos
  fileName?: string; // para archivos
  fileType?: string; // para archivos
  fileSize?: number; // para archivos
  duration?: number; // para mensajes de voz
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  messages: Message[];
}
