import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { Textarea } from "@/shared/ui/textarea";
import MCButton from "@/shared/components/forms/MCButton";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MCDialogBase } from "@/shared/components/MCDialogBase"; // <-- Usa tu componente base
import { useTranslation } from "react-i18next";

const doctorAvatar =
  "https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg";
const doctorName = "Dr. Cristiano Ronaldo";

export function getDoctorAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  if (avatarUrl) {
    return (
      <Avatar className="h-20 w-20 rounded-full overflow-hidden">
        <AvatarImage
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <AvatarFallback className="bg-muted text-muted-foreground">
          {(name ?? "")
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
    );
  } else {
    return (
      <MCUserAvatar
        name={name}
        square
        size={96}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      />
    );
  }
}

type RatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

export const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
}: RatingModalProps) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const isMobile = useIsMobile();

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
    <MCDialogBase
      open={isOpen}
      onOpenChange={onClose}
      title={t("ratingModal.title")}
      size="md"
      className="sm:max-w-md"
    >
      <div className="flex flex-col">
        {/* Doctor info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            {getDoctorAvatar({ name: doctorName, avatarUrl: doctorAvatar })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{doctorName}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("ratingModal.specialty")}
            </p>
          </div>
        </div>

        {/* Rating section */}
        <div className="w-full mb-6">
          <p className="text-sm font-medium mb-3">
            {t("ratingModal.rateExperience")}
          </p>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="rating-star"
              >
                <Star
                  className={`w-16 h-16 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-primary/10 fill-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment section */}
        <div className="w-full mb-6">
          <p className="text-sm font-medium mb-2">
            {t("ratingModal.leaveComment")}
          </p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("ratingModal.commentPlaceholder")}
            className="min-h-[100px] rounded-2xl resize-none border-primary/15"
          />
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <MCButton
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full"
          >
            {t("ratingModal.submit")}
          </MCButton>
          <button
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("ratingModal.skip")}
          </button>
        </div>
      </div>
    </MCDialogBase>
  );
};
