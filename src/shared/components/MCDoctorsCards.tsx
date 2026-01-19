import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/shared/ui/card";
import { Button } from "../ui/button";
import { Star, Heart, Languages, ShieldCheck, Stethoscope } from "lucide-react";
import MCButton from "./forms/MCButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Doctor {
  key: number;
  name: string;
  specialty: string;
  rating: number;
  reviews?: number;
  yearsOfExperience?: number;
  languages?: string[];
  insuranceAccepted?: string[];
  isFavorite?: boolean;
  fullInfoView: boolean;
  urlImage: string;
}

import { useIsMobile } from "@/lib/hooks/useIsMobile";

function MCDoctorsCards({
  name,
  specialty,
  rating,
  yearsOfExperience,
  languages,
  insuranceAccepted,
  isFavorite,
  urlImage,
}: Doctor) {
  const isMobile = useIsMobile();

  return (
    <Card
      className={`rounded-3xl shadow-sm bg-transparent hover:shadow-lg transition-shadow duration-300 border-primary/10 ${isMobile ? "max-w-full" : "max-w-full"} h-full flex flex-col`}
    >
      <div className="relative overflow-hidden rounded-3xl w-full">
        <img
          src={urlImage}
          alt={name}
          className={`rounded-3xl w-full object-cover transition-transform duration-500 hover:scale-110 ${isMobile ? "h-48" : "h-64"}`}
        />
        {isFavorite && (
          <div className="absolute top-4 right-4 bg-background/20 rounded-full">
            <Heart
              className="text-transparent border-none p-1"
              fill="red"
              size={isMobile ? 24 : 30}
            />
          </div>
        )}
      </div>
      <CardContent className={isMobile ? "pt-3 pb-2 px-3" : "pt-4 pb-2"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className={`font-semibold text-primary ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {name}
            </CardTitle>
            <div
              className={`text-secondary ${isMobile ? "text-base" : "text-lg"}`}
            >
              {specialty}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star
              className="text-[#F7B500] mb-1"
              fill="#F7B500"
              size={isMobile ? 18 : 20}
            />
            <span
              className={`text-primary font-medium ${isMobile ? "text-base" : "text-lg"}`}
            >
              {rating}
            </span>
          </div>
        </div>
        <div
          className={
            isMobile
              ? "my-3 h-[1.5px] w-full rounded-full bg-gradient-to-r from-primary/2 via-primary/30 to-primary/2"
              : "my-4 h-[1.5px] w-full rounded-full bg-gradient-to-r from-primary/2 via-primary/30 to-primary/2"
          }
          aria-hidden="true"
        />
        <div
          className={`flex flex-col text-primary ${isMobile ? "gap-1.5 text-sm" : "gap-2 text-base"}`}
        >
          <div className="flex items-center gap-2">
            <Stethoscope
              size={isMobile ? 18 : 20}
              className="text-secondary flex-shrink-0"
            />
            <span>
              {yearsOfExperience
                ? `${yearsOfExperience}+ años de experiencia`
                : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Languages
              size={isMobile ? 18 : 20}
              className="text-secondary flex-shrink-0"
            />
            <span className="max-w-full">{languages?.join(", ")}</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck
              size={isMobile ? 18 : 20}
              className="text-secondary flex-shrink-0"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col truncate cursor-pointer">
                    <span className="font-semibold">Seguros aceptados:</span>
                    {insuranceAccepted && insuranceAccepted.length > 4 ? (
                      <>
                        <span>
                          {insuranceAccepted
                            .slice(0, Math.ceil(insuranceAccepted.length / 2))
                            .join(", ")}
                        </span>
                        <span>
                          {insuranceAccepted
                            .slice(Math.ceil(insuranceAccepted.length / 2))
                            .join(", ")}
                        </span>
                      </>
                    ) : (
                      <span>{insuranceAccepted?.join(", ")}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{insuranceAccepted?.join(", ")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <div
        className={`flex w-full max-w-full gap-2 ${
          isMobile ? "flex-col pt-3" : "flex-row pt-4"
        } flex-wrap mt-auto`}
      >
        <MCButton
          size="s"
          className={`min-w-[110px] w-full flex-1 flex justify-center items-center ${isMobile ? "text-base" : "text-lg"}`}
        >
          Agendar Cita
        </MCButton>
        <MCButton
          size="s"
          variant="secondary"
          className={`min-w-[110px] w-full flex-1 flex justify-center items-center ${isMobile ? "text-base" : "text-lg"}`}
        >
          Ver Perfil
        </MCButton>
        <MCButton
          size="s"
          variant="secondary"
          className={`min-w-[110px] w-full flex-1 flex justify-center items-center ${isMobile ? "text-base" : "text-lg"}`}
        >
          Historial
        </MCButton>
      </div>
    </Card>
  );
}

export default MCDoctorsCards;
