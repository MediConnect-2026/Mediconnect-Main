import { jsPDF } from "jspdf";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrescriptionDocument {
  name: string;
  url: string;
}

export interface PrescriptionData {
  service: string;
  specialty: string;
  date: string;
  time: string;
  price: string | number;
  numberOfPatients?: number;
  modality?: string;
  location?: string;
  diagnosis: string;
  observations: string;
  documents?: PrescriptionDocument[];
  doctorName: string;
  doctorSpecialty?: string;
  patientName?: string;
  insurance?: string; // ← nuevo campo seguros
  viewerRole?: "DOCTOR" | "PATIENT" | string;
  fileName?: string;
  language?: "es" | "en";
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const GREEN_DARK: [number, number, number] = [11, 44, 18];
const GREEN_MID: [number, number, number] = [52, 110, 60];
const GRAY_TEXT: [number, number, number] = [80, 80, 80];
const INK: [number, number, number] = [20, 20, 20];
const WHITE: [number, number, number] = [255, 255, 255];
const RULE: [number, number, number] = [200, 210, 202];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImageAsBase64(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ─── Main Function ────────────────────────────────────────────────────────────

export const MCGeneratePrescriptionPDF = async (
  data: PrescriptionData,
): Promise<boolean> => {
  const {
    service,
    specialty,
    date,
    time,
    price,
    numberOfPatients,
    modality,
    location,
    diagnosis,
    observations,
    doctorName,
    doctorSpecialty,
    patientName,
    insurance,
    viewerRole = "PATIENT",
    fileName = "receta-medica",
    language = "es",
  } = data;

  const isDoctor = viewerRole === "DOCTOR";
  const locale = language === "es" ? "es-ES" : "en-US";
  const now = new Date();
  const formattedDate = now.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const L =
    language === "es"
      ? {
          title: "RECETA MÉDICA",
          date: "Fecha de consulta",
          time: "Horario",
          price: "Precio",
          patients: "N° Pacientes",
          modality: "Modalidad",
          location: "Ubicación",
          insurance: "Seguro",
          diagnosis: "Diagnóstico",
          observations: "Observaciones",
          patient: "Paciente",
          doctor: "Médico",
          generated: "Generado el",
          footer: "MediConnect · Documento Confidencial",
          page: "Pág.",
          of: "de",
          noDiag: "Sin diagnóstico registrado.",
          noObs: "Sin observaciones adicionales.",
          noInsurance: "Sin seguro registrado.",
        }
      : {
          title: "MEDICAL PRESCRIPTION",
          date: "Appointment date",
          time: "Time",
          price: "Price",
          patients: "Patients",
          modality: "Modality",
          location: "Location",
          insurance: "Insurance",
          diagnosis: "Diagnosis",
          observations: "Observations",
          patient: "Patient",
          doctor: "Physician",
          generated: "Generated on",
          footer: "MediConnect · Confidential Document",
          page: "Page",
          of: "of",
          noDiag: "No diagnosis recorded.",
          noObs: "No additional observations.",
          noInsurance: "No insurance registered.",
        };

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const mL = 18;
    const mR = 18;
    const cW = W - mL - mR;

    // ── White background ────────────────────────────────────────────────────
    doc.setFillColor(...WHITE);
    doc.rect(0, 0, W, H, "F");

    // ── Header band ─────────────────────────────────────────────────────────
    const HEADER_H = 34;
    doc.setFillColor(...GREEN_DARK);
    doc.rect(0, 0, W, HEADER_H, "F");

    // Logo
    try {
      const logoUrl =
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png";
      const logoB64 = await loadImageAsBase64(logoUrl);
      if (logoB64) {
        doc.addImage(logoB64, "PNG", mL, 8, 38, 17);
      }
    } catch (_) {
      /* silent */
    }

    // Title — pure white
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(L.title, W - mR, 16, { align: "right" });

    // Service — pure white (antes era verde apagado)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...WHITE); // ← blanco puro
    doc.text(service, W - mR, 24, { align: "right" });

    // Generated date — pure white (antes era verde apagado)
    doc.setFontSize(7);
    doc.setTextColor(...WHITE); // ← blanco puro
    doc.text(`${L.generated} ${formattedDate}`, W - mR, 31, { align: "right" });

    let y = HEADER_H + 10;

    // ── Doctor / Patient info row ────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN_MID);
    doc.text(`${L.doctor}:`, mL, y);
    doc.setTextColor(...INK);
    doc.text(` ${doctorName}`, mL + doc.getTextWidth(`${L.doctor}: `), y);

    // Especialidad debajo del nombre del doctor
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(doctorSpecialty || specialty, mL, y + 6);

    if (isDoctor && patientName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...GREEN_MID);
      doc.text(`${L.patient}:`, W / 2 + 4, y);
      doc.setTextColor(...INK);
      doc.text(
        ` ${patientName}`,
        W / 2 + 4 + doc.getTextWidth(`${L.patient}: `),
        y,
      );
    }

    y += 12;

    // Thin rule
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.4);
    doc.line(mL, y, W - mR, y);
    y += 8;

    // ── Appointment details — SIN "Especialidad" (ya está bajo el nombre) ───
    const detailRows: { label: string; value: string }[] = [
      { label: L.date, value: date },
      { label: L.time, value: time },
      { label: L.price, value: `$${price}` },
    ];
    if (numberOfPatients !== undefined)
      detailRows.push({ label: L.patients, value: String(numberOfPatients) });
    if (modality) detailRows.push({ label: L.modality, value: modality });
    if (location) detailRows.push({ label: L.location, value: location });

    // Seguros ← nuevo
    detailRows.push({
      label: L.insurance,
      value: insurance || L.noInsurance,
    });

    // Three-column grid
    const colCount = 3;
    const colW = cW / colCount;
    const itemH = 14;

    detailRows.forEach((row, i) => {
      const col = i % colCount;
      const rowIdx = Math.floor(i / colCount);
      const fx = mL + col * colW;
      const fy = y + rowIdx * itemH;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY_TEXT);
      doc.text(row.label.toUpperCase(), fx, fy);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(row.value, fx, fy + 6);
    });

    const totalDetailRows = Math.ceil(detailRows.length / colCount);
    y += totalDetailRows * itemH + 10;

    // ── Diagnosis ────────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN_MID);
    doc.text(L.diagnosis.toUpperCase(), mL, y);
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.5);
    doc.line(
      mL,
      y + 1.5,
      mL + doc.getTextWidth(L.diagnosis.toUpperCase()),
      y + 1.5,
    );
    y += 6;

    const diagText = diagnosis || L.noDiag;
    const diagLines = doc.splitTextToSize(diagText, cW);
    const diagH = diagLines.length * 5.5 + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    diagLines.forEach((line: string, i: number) => {
      doc.text(line, mL, y + 5 + i * 5.5);
    });
    y += diagH + 8;

    // ── Observations ─────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN_MID);
    doc.text(L.observations.toUpperCase(), mL, y);
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.5);
    doc.line(
      mL,
      y + 1.5,
      mL + doc.getTextWidth(L.observations.toUpperCase()),
      y + 1.5,
    );
    y += 6;

    const obsText = observations || L.noObs;
    const obsLines = doc.splitTextToSize(obsText, cW);
    const obsH = obsLines.length * 5.5 + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    obsLines.forEach((line: string, i: number) => {
      doc.text(line, mL, y + 5 + i * 5.5);
    });
    y += obsH + 8;

    // ── Footer on every page ─────────────────────────────────────────────────
    const totalPages: number = (doc.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.4);
      doc.line(mL, H - 14, W - mR, H - 14);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_TEXT);
      doc.text(L.footer, W / 2, H - 9, { align: "center" });
      doc.text(`${L.page} ${p} ${L.of} ${totalPages}`, W - mR, H - 9, {
        align: "right",
      });
    }

    doc.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating prescription PDF:", error);
    return false;
  }
};

export default MCGeneratePrescriptionPDF;
