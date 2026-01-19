import React, { useState } from "react";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import MCButton from "@/shared/components/forms/MCButton";
import {
  History,
  Settings,
  Shield,
  Copy,
  LogOut,
  MoreHorizontal,
  Heart,
  AlertTriangle,
  Ellipsis,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "@/shared/navigation/userMenu/MCUserBanner";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import MCDoctorsCards from "@/shared/components/MCDoctorsCards";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import PatientProfileBannerMobile from "@/features/patient/components/PatientProfileBannerMobile";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
function PatientProfilePage() {
  const [openSheet, setOpenSheet] = useState(false);
  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();

  const insuranceLogos = [
    { name: "SeNaSa" },
    { name: "ARS Palic" },
    { name: "Humano Seguros" },
    { name: "MAPFRE ARS" },
    { name: "ARS Universal" },
    { name: "Seguros Crecer" },
    { name: "ARS Yunen" },
  ];

  return (
    <div
      className={`w-full ${isMobile ? "flex flex-col" : "grid grid-cols-[5%_95%]"} justify-between items-start ${isMobile ? "p-2" : "p-4"}`}
    >
      {!isMobile && (
        <aside>
          <MCBackButton variant="background" />
        </aside>
      )}

      <main className="w-full flex flex-col justify-center items-center gap-8">
        {isMobile && (
          <div className="w-full px-2 py-3">
            <MCBackButton variant="background" />
          </div>
        )}

        {isMobile ? (
          <PatientProfileBannerMobile user={user} setOpenSheet={setOpenSheet} />
        ) : (
          <div className="w-[90%] shadow-md rounded-4xl border-0">
            <div className="relative h-60 flex items-end rounded-t-4xl bg-background ">
              {user?.banner ? (
                <img
                  src={user.banner}
                  alt="Banner de usuario"
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-4xl "
                  style={{ zIndex: 1 }}
                />
              ) : (
                <MCUserBanner
                  className="absolute top-0 left-0 w-full h-full rounded-t-4xl   "
                  name={user?.name || "IliaTopuria"}
                />
              )}
              <div
                className="absolute left-10 bottom-[-80px] w-full"
                style={{ zIndex: 2 }}
              >
                <div className="flex items-center w-[95%]">
                  {user?.avatar ? (
                    <UiAvatar className="w-40 h-40 rounded-full border-4 border-background">
                      <AvatarImage src={user.avatar} alt="User Avatar" />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </UiAvatar>
                  ) : (
                    <MCUserAvatar
                      name={user?.name || "IliaTopuria"}
                      size={180}
                      className="border-6 "
                    />
                  )}

                  <div className="mt-25 w-full flex justify-between items-center px-6 ">
                    <div className="flex flex-col">
                      <h3 className="text-primary font-semibold text-2xl">
                        Ilia Topuria
                      </h3>
                      <p className="text-primary">
                        <span className="font-medium">Paciente desde:</span> 15
                        de Enero, 2025
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <MCButton
                        variant="secondary"
                        size="m"
                        className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                        onClick={() => setOpenSheet(true)}
                      >
                        Editar Perfil
                      </MCButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner">
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <History className="w-4 h-4 mr-2" />
                            Ver historial completo
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            Privacidad y seguridad
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar perfil
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <LogOut className="w-4 h-4 mr-2 text-red-500" />
                            <span className="text-red-500">Cerrar sesión</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background h-35 rounded-b-4xl"></div>
          </div>
        )}

        <div className={isMobile ? "w-full px-2" : "w-[90%]"}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-[64%_34%]"} justify-between w-full`}
          >
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-2"}>
                <h2
                  className={`mb-6 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  Mis Seguros Médicos
                </h2>
                <div
                  className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-2`}
                >
                  {insuranceLogos.map((insurance, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20 cursor-pointer"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border-2 font-bold border-primary/10 text-foreground">
                        {insurance.name.substring(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {insurance.name}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 p-2">
                    <span className="text-sm text-primary hover:underline hover:text-secondary cursor-pointer">
                      Más planes de Seguros dentro de la red Ver todo
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-2"}>
                <h2
                  className={`mb-6 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  Información Médica
                </h2>
                <div
                  className={`mb-6 grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Edad</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      45 años
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IMC</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      26.1
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Altura</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      175 cm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peso</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      80 kg
                    </p>
                  </div>
                </div>
                <div className="border-t border-muted my-4"></div>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground">
                    Tipo de sangre
                  </p>
                  <p
                    className={`${isMobile ? "text-base" : "text-lg"} font-bold text-foreground`}
                  >
                    O+
                  </p>
                </div>
                <div className="border-t border-muted my-4"></div>
                <div
                  className={`${isMobile ? "max-h-64" : "max-h-48"} overflow-y-auto pr-2`}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <Heart className="h-4 w-4" />
                      <span className="font-medium">Alergias</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Penicilina (produce erupción cutánea)
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Penicilina (produce erupción cutánea)
                    </p>
                  </div>
                  <div className="border-t border-muted my-4"></div>
                  <div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Condiciones</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Apendicectomía en 2010
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Antecedentes familiares de diabetes tipo 2
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card
          className={`animate-fade-in rounded-4xl border-0 shadow-md bg-background ${isMobile ? "w-full" : "w-[90%]"}`}
        >
          <CardHeader className={isMobile ? "p-4" : "p-2"}>
            <div className="flex justify-between items-center">
              <h2
                className={` ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
              >
                Doctores Favoritos
              </h2>

              <MCFilterPopover activeFiltersCount={0} onClearFilters={() => {}}>
                <div>nose no</div>
              </MCFilterPopover>
            </div>
          </CardHeader>

          <CardContent
            className={`mb-6 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 3xl:grid-cols-3 gap-4 ${isMobile ? "px-2" : ""}`}
          >
            <MCDoctorsCards
              key={1}
              name="Alexander Gil"
              specialty="Cardiólogo"
              rating={4.8}
              yearsOfExperience={15}
              languages={["Español", "Inglés", "Francés"]}
              insuranceAccepted={["ARS humano", "ARS Universal", "ARS Senasa"]}
              isFavorite={true}
              fullInfoView={true}
              urlImage="https://i.pinimg.com/736x/58/8b/f4/588bf4e2b04c192c96b297d7627b31e6.jpg"
            />
            <MCDoctorsCards
              key={2}
              name="María López"
              specialty="Dermatóloga"
              rating={4.9}
              yearsOfExperience={10}
              languages={["Español", "Inglés"]}
              insuranceAccepted={["ARS Palic", "Humano Seguros"]}
              isFavorite={true}
              fullInfoView={true}
              urlImage="https://i.pinimg.com/736x/22/1f/d5/221fd565c4175235f7ae93d2ba80c641.jpg"
            />
            <MCDoctorsCards
              key={3}
              name="Carlos Méndez"
              specialty="Pediatra"
              rating={4.7}
              yearsOfExperience={8}
              languages={["Español"]}
              insuranceAccepted={["ARS Universal"]}
              isFavorite={true}
              fullInfoView={true}
              urlImage="https://i.pinimg.com/736x/b5/09/6b/b5096bf449df00f2f3fc52d8a4de5c70.jpg"
            />
            <MCDoctorsCards
              key={4}
              name="Sofía Ramírez"
              specialty="Endocrinóloga"
              rating={4.6}
              yearsOfExperience={12}
              languages={["Español", "Francés"]}
              insuranceAccepted={["ARS Senasa", "MAPFRE ARS", "ARS Yunen"]}
              isFavorite={true}
              fullInfoView={true}
              urlImage="https://i.pinimg.com/736x/8f/7a/9c/8f7a9cb4ea42e64fa5c7025a9918d62c.jpg"
            />
          </CardContent>
        </Card>

        <MCSheetProfile open={openSheet} onOpenChange={setOpenSheet} />
      </main>
    </div>
  );
}

export default PatientProfilePage;
