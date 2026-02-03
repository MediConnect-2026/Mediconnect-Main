import { useState } from "react";
import { X, Star, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import doctorAvatar from "@/assets/doctor-avatar.jpg";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
  };

  const handleSkip = () => {
    onClose();
    setRating(0);
    setComment("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Califica tu consulta
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* Doctor info */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={doctorAvatar} />
              <AvatarFallback>CR</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Dr. Cristiano Ronaldo</p>
                <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
              </div>
              <p className="text-sm text-muted-foreground">
                Especialista en Medicina Interna
              </p>
            </div>
          </div>

          {/* Rating section */}
          <div className="w-full mb-6">
            <p className="text-sm font-medium mb-3">Califica tu experiencia</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="rating-star"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted stroke-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment section */}
          <div className="w-full mb-6">
            <p className="text-sm font-medium mb-2">
              Deja un comentario (Opcional)
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full"
            >
              Enviar calificación
            </Button>
            <button
              onClick={handleSkip}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
