import React, { useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { mockAppointments } from "@/data/appointments";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/ui/empty";
import { AlertCircle, Download } from "lucide-react";
import PreviewDocumentsDialog from "./PreviewDocumentsDialog";
import { Separator } from "@/shared/ui/separator";
import { ImageCarouselModal } from "@/features/doctor/components/healthService/ImageCarouselModal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import { MCGeneratePrescriptionPDF } from "@/shared/components/Mcgenerateprescriptionpdf";
import { useAppStore } from "@/stores/useAppStore";

interface MedicalPrescriptionDialogProps {
  children?: React.ReactNode;
  appointmentId: string;
  historyId: string;
}

function MedicalPrescriptionDialog({
  children,
  appointmentId,
  historyId,
}: MedicalPrescriptionDialogProps) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  const user = useAppStore((state) => state.user);
  const userRole = user?.role || "PATIENT";

  const appointment = mockAppointments.find((apt) => apt.id === appointmentId);
  const historyItem = appointment?.history?.find(
    (hist) => hist.id === historyId,
  );

  const handleGeneratePDF = async () => {
    if (!appointment || !historyItem || !historyItem.medicalPrescription) {
      return;
    }

    const pdfData = {
      service: historyItem.service,
      specialty: appointment.doctorSpecialty,
      date: appointment.date,
      time: appointment.time,
      price: appointment.price ?? 0,
      numberOfPatients: appointment.numberOfPatients,
      modality: appointment.appointmentType,
      location: historyItem.address,

      // Medical info
      diagnosis: historyItem.medicalPrescription.diagnosis,
      observations: historyItem.medicalPrescription.observations,
      documents: historyItem.medicalPrescription.documents || [],

      // Seguros — usa (appointment as any).insurance si el campo aún no está tipado
      insurance: (appointment as any).insurance ?? undefined,

      // People
      doctorName: appointment.doctorName,
      doctorSpecialty: appointment.doctorSpecialty,
      patientName: userRole === "DOCTOR" ? user?.name : undefined,

      // Meta
      viewerRole: userRole,
      fileName: `receta-medica-${appointment.id}-${historyItem.id}`,
      language: "es" as const,
    };

    await MCGeneratePrescriptionPDF(pdfData);
  };

  if (!appointment || !historyItem || !historyItem.medicalPrescription) {
    return (
      <MCModalBase
        id={`prescription-${appointmentId}-${historyId}`}
        title={t("appointment.medicalPrescription")}
        trigger={children}
        size={"lg"}
        variant="info"
      >
        <Empty className="py-12">
          <EmptyContent>
            <EmptyMedia>
              <AlertCircle size={48} className="text-destructive/40" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t("appointment.errorTitle")}</EmptyTitle>
              <EmptyDescription>
                {t("appointment.prescriptionNotFound")}
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      </MCModalBase>
    );
  }

  const imageDocuments =
    historyItem.medicalPrescription.documents?.filter((doc) =>
      doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i),
    ) || [];

  const imageUrls = imageDocuments.map((doc) => doc.url);

  return (
    <MCModalBase
      id={`prescription-${appointmentId}-${historyId}`}
      title={historyItem.service}
      trigger={children}
      size={"xl"}
      variant="info"
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full">
          <MCPDFButton onClick={handleGeneratePDF} />
        </div>

        <Separator className="my-1" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.service")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {historyItem.service}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.specialty")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {appointment.doctorSpecialty}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.date")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {appointment.date}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.schedule")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {appointment.time}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.price")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              ${appointment.price}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.numberOfPatients")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {appointment.numberOfPatients}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.modality")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {appointment.appointmentType}
            </p>
          </div>
          {/* Seguros */}
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.insure")}
            </h3>
            <p className="text-lg text-primary font-medium break-words max-w-xs">
              {(appointment as any).insurance ??
                t("appointment.noInsurance") ??
                "—"}
            </p>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-base sm:text-lg text-primary font-medium">
              {t("appointment.diagnosis")}
            </h3>
            <div className="w-full bg-bg-btn-secondary border border-primary/5 p-3 sm:p-4 rounded-xl">
              <p className="text-sm sm:text-base text-primary font-medium break-words">
                {historyItem.medicalPrescription.diagnosis}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-base sm:text-lg text-primary font-medium">
              {t("appointment.observations")}
            </h3>
            <div className="w-full bg-bg-btn-secondary border border-primary/5 p-3 sm:p-4 rounded-xl">
              <p className="text-sm sm:text-base text-primary font-medium break-words">
                {historyItem.medicalPrescription.observations}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg text-primary font-medium">
            {t("appointment.attachedDocuments")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {historyItem.medicalPrescription.documents &&
            historyItem.medicalPrescription.documents.length > 0 ? (
              historyItem.medicalPrescription.documents.map((doc, idx) => {
                const truncatedName = truncateFileName(
                  doc.name,
                  isMobile ? 18 : 22,
                );
                const isTruncated = truncatedName !== doc.name;
                const isImage = doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                const imageIndex = imageUrls.indexOf(doc.url);

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center border border-primary/10 rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-transparent w-full"
                  >
                    {isImage ? (
                      <div
                        onClick={() => {
                          setCarouselStartIndex(imageIndex);
                          setCarouselOpen(true);
                        }}
                        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/5 w-full aspect-[4/3] max-h-40 sm:max-h-56 mb-2 flex items-center justify-center bg-background cursor-pointer group hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          style={{ maxHeight: isMobile ? "160px" : "224px" }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm sm:text-lg font-semibold px-2 text-center">
                            Ver imagen
                          </span>
                        </div>
                      </div>
                    ) : (
                      <PreviewDocumentsDialog
                        documentUrl={doc.url}
                        documentType={doc.url.split(".").pop()?.toLowerCase()}
                        documentName={doc.name}
                      >
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/5 w-full aspect-[4/3] max-h-40 sm:max-h-56 mb-2 flex items-center justify-center bg-background cursor-pointer group hover:opacity-80 transition-opacity">
                          {doc.url.match(/\.pdf$/i) ? (
                            <iframe
                              src={doc.url}
                              title={doc.name}
                              className="w-full h-full pointer-events-none"
                              style={{
                                border: "none",
                                maxHeight: isMobile ? "160px" : "224px",
                              }}
                            />
                          ) : (
                            <span className="text-xs text-primary/10">
                              Click to preview
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm sm:text-lg font-semibold px-2 text-center">
                              Ver documento
                            </span>
                          </div>
                        </div>
                      </PreviewDocumentsDialog>
                    )}

                    {isTruncated ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs sm:text-sm font-medium text-primary text-center break-all mb-1 cursor-pointer px-1">
                              {truncatedName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="text-xs sm:text-sm">
                              {doc.name}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-primary text-center break-all mb-1 px-1">
                        {doc.name}
                      </span>
                    )}

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <span className="text-xs text-muted-foreground items-center flex">
                        {doc.url.split(".").pop()?.toUpperCase() || "FILE"}
                      </span>
                      <a
                        href={doc.url}
                        download
                        className="text-xs text-secondary underline flex items-center"
                      >
                        <Download className="inline-block mr-1 size-3" />
                        {t("appointment.download") || "Descargar"}
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <Empty className="py-8 w-full">
                  <EmptyContent>
                    <EmptyMedia>
                      <AlertCircle
                        size={isMobile ? 32 : 40}
                        className="text-destructive/40"
                      />
                    </EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle className="text-sm sm:text-base">
                        {t("appointment.noDocumentsTitle")}
                      </EmptyTitle>
                      <EmptyDescription className="text-xs sm:text-sm">
                        {t("appointment.noDocuments")}
                      </EmptyDescription>
                    </EmptyHeader>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageCarouselModal
        images={imageUrls}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        startIndex={carouselStartIndex}
      />
    </MCModalBase>
  );
}

function truncateFileName(name: string, maxLength = 22) {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + "...";
}

export default MedicalPrescriptionDialog;
