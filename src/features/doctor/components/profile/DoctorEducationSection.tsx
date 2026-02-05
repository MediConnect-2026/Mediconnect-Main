import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";

interface Education {
  degree: string;
  institution: string;
  location: string;
  year: string;
}

interface Props {
  education: Education[];
}

const DoctorEducationSection = ({ education }: Props) => {
  const { t } = useTranslation("doctor");

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          <span className="inline-flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-secondary" />
            {t("profile.education.title", "Formación Académica")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <ul className="space-y-3">
          {education.map((edu, idx) => {
            const institutionRef = useRef<HTMLDivElement>(null);
            const [showTooltip, setShowTooltip] = useState(false);

            const handleMouseEnter = () => {
              const el = institutionRef.current;
              if (el && el.scrollWidth > el.clientWidth) {
                setShowTooltip(true);
              } else {
                setShowTooltip(false);
              }
            };

            const handleMouseLeave = () => setShowTooltip(false);

            return (
              <li key={idx} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                  <TooltipProvider>
                    <Tooltip open={showTooltip}>
                      <TooltipTrigger asChild>
                        <div
                          ref={institutionRef}
                          className="font-semibold max-w-full truncate cursor-pointer"
                          style={{ maxWidth: "100%" }}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          {edu.institution}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{edu.institution}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm">{edu.degree}</div>
                <div className="text-xs text-muted-foreground">{edu.year}</div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DoctorEducationSection;
