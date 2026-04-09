import { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import useClickOutside from "@/lib/hooks/useClickOutside";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { createPortal } from "react-dom";

interface ImageCarouselModalProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  startIndex?: number;
}

const TRANSITION: Transition = {
  type: "spring",
  bounce: 0.1,
  duration: 0.4,
};

export const ImageCarouselModal = ({
  images,
  open,
  onClose,
  startIndex = 0,
}: ImageCarouselModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Use the click outside hook
  useClickOutside(modalRef as React.RefObject<HTMLElement>, onClose);

  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
    }
  }, [open, startIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, goNext, goPrev]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          style={{ zIndex: 9999 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSITION}
          role="dialog"
          aria-modal="true"
        >
          {/* Improved Backdrop with animation */}
          <motion.div
            className="absolute inset-0 bg-black/80 sm:bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
          />

          {/* Modal Content Container */}
          <motion.div
            ref={modalRef}
            className="relative z-10 w-full h-full flex items-center justify-center px-2 sm:px-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={TRANSITION}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              aria-label="Cerrar galería"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>

            {/* Counter */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 sm:top-4 z-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-white text-xs sm:text-sm font-body font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </motion.div>

            {/* Navigation arrows - Hide on mobile or show as overlay */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={goPrev}
                  className={`absolute ${isMobile ? "left-2 p-2" : "left-4 p-3"
                    } z-50 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors backdrop-blur-sm`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft
                    className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-white`}
                  />
                </motion.button>
                <motion.button
                  onClick={goNext}
                  className={`absolute ${isMobile ? "right-2 p-2" : "right-4 p-3"
                    } z-50 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors backdrop-blur-sm`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight
                    className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-white`}
                  />
                </motion.button>
              </>
            )}

            {/* Main image */}
            <motion.div
              className="max-w-[95vw] sm:max-w-[90vw] max-h-[70vh] sm:max-h-[85vh] flex items-center justify-center"
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={TRANSITION}
            >
              <img
                src={images[currentIndex]}
                alt={`Imagen ${currentIndex + 1}`}
                className="max-w-full max-h-[70vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            </motion.div>

            {/* Thumbnail strip - Conditional rendering for mobile */}
            {images.length > 1 && (
              <motion.div
                className={`absolute ${isMobile
                  ? "bottom-2 px-2 py-2 gap-1.5"
                  : "bottom-4 px-4 py-3 gap-2"
                  } left-1/2 -translate-x-1/2 z-50 flex rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm max-w-[95vw] sm:max-w-[90vw] overflow-x-auto scrollbar-hide`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`flex-shrink-0 ${isMobile ? "w-10 h-10 sm:w-12 sm:h-12" : "w-14 h-14"
                      } rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 ${i === currentIndex
                        ? "ring-2 ring-white scale-110 opacity-100"
                        : "opacity-60 hover:opacity-100 active:opacity-100"
                      }`}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${i + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Swipe indicator for mobile - Show briefly on open */}
            {isMobile && images.length > 1 && (
              <motion.div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, times: [0, 0.1, 0.8, 1] }}
              >
                <span className="text-white text-xs font-body">
                  Desliza para navegar
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
