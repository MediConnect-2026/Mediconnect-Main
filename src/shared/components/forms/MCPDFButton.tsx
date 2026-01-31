import React from "react";
import { Button } from "@/shared/ui/button";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface MCPDFButtonProps {
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  className?: string;
}

function MCPDFButton({
  onClick,
  loading = false,
  className,
}: MCPDFButtonProps) {
  const { t } = useTranslation("common");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleClick = async () => {
    if (!onClick || isGenerating || loading) return;

    try {
      setIsGenerating(true);
      await onClick();
    } catch (error) {
      console.error(t("ui.errors.pdfGenerationError"), error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = loading || isGenerating;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className={cn(
        "flex w-full items-center text-primary px-4 py-3.5 text-base sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-5 lg:py-5 lg:text-md rounded-4xl border-primary/20 bg-bg-btn-secondary",
        "gap-2",
        "hover:bg-bg-btn-secondary/20 hover:text-primary",
        "active:bg-bg-btn-secondary/30 active:text-primary",
        "active:scale-95",
        "transition-colors duration-150",
        isLoading && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <FileText className={cn("w-4 h-4", isLoading && "animate-pulse")} />
      <span>
        {isLoading
          ? t("ui.buttons.generatingPDF")
          : t("ui.buttons.generatePDF")}
      </span>
    </Button>
  );
}

export default MCPDFButton;
