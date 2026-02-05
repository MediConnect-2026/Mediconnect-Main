import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";

interface Experience {
  position: string;
  institution: string;
  period: string;
  description: string;
}

interface Props {
  experience: Experience[];
}

const DoctorExperienceSection = ({ experience }: Props) => {
  const { t } = useTranslation("doctor");
  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-secondary" />
            {t("profile.experience.title", "Experiencia Profesional")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <ul className="space-y-3">
          {experience.map((exp, idx) => {
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
                <div className="flex gap-2 items-center ">
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
                          {exp.institution}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{exp.institution}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm">{exp.position}</div>
                <div className="text-xs text-muted-foreground">
                  {exp.period}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DoctorExperienceSection;
