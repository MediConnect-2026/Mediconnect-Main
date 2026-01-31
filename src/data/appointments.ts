export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  evaluationType: string;
  date: string;
  time: string;
  description?: string;
  appointmentType: "virtual" | "in_person";
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
  location: {
    latitude: number;
    longitude: number;
  };
  Service?: string;
  Reason?: string;
  price?: number;
  numberOfPatients?: number;
  patientName?: string;

  history?: {
    date: string;
    time: string;
    address: string;
    service: string;
    diagnosis: string;
    observations: string;
    documents?: {
      name: string;
      url: string;
    }[];
  }[];
}

const hospitals = [
  { latitude: 18.4762, longitude: -69.9128 },
  { latitude: 18.4675, longitude: -69.9307 },
  { latitude: 18.4746, longitude: -69.9111 },
  { latitude: 18.4634, longitude: -69.9302 },
  { latitude: 18.4701, longitude: -69.9221 },
  { latitude: 18.4712, longitude: -69.9365 },
  { latitude: 18.4639, longitude: -69.9277 },
  { latitude: 18.4728, longitude: -69.9153 },
  { latitude: 18.4698, longitude: -69.9309 },
  { latitude: 18.4652, longitude: -69.9271 },
  { latitude: 18.4717, longitude: -69.9322 },
  { latitude: 18.4685, longitude: -69.9293 },
  { latitude: 18.4733, longitude: -69.9281 },
];

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorId: "d1",
    doctorName: "Daniel Ramírez",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: hospitals[0],
    status: "scheduled",
    Service: "Consulta Cardiológica",
    Reason: "Chequeo anual de corazón",
    description: "Chequeo anual de corazón",
    price: 1200,
    numberOfPatients: 1,
    patientName: "Juan Pérez",
    history: [
      {
        date: "15 Sep, 2025",
        time: "09:00 AM",
        address: "Av. Principal 123",
        service: "Consulta Cardiológica",
        diagnosis: "Hipertensión leve",
        observations: "Recomendada dieta baja en sal.",
        documents: [{ name: "Electrocardiograma.pdf", url: "/docs/ecg1.pdf" }],
      },
      {
        date: "10 Jun, 2025",
        time: "11:00 AM",
        address: "Av. Principal 123",
        service: "Chequeo General",
        diagnosis: "Sin novedades",
        observations: "Paciente estable.",
        documents: [],
      },
    ],
  },
  {
    id: "2",
    doctorId: "d2",
    doctorName: "Mariana López",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: hospitals[1],
    status: "pending",
    Service: "Consulta Cardiológica",
    Reason: "Molestias en el pecho",
    description: "Molestias en el pecho",
    price: 1200,
    numberOfPatients: 1,
    patientName: "Ana Gómez",
    history: [
      {
        date: "20 Ago, 2025",
        time: "10:00 AM",
        address: "Calle Salud 456",
        service: "Consulta Cardiológica",
        diagnosis: "Arritmia leve",
        observations: "Control en 3 meses.",
        documents: [{ name: "InformeArritmia.pdf", url: "/docs/arr1.pdf" }],
      },
      {
        date: "15 May, 2025",
        time: "12:00 PM",
        address: "Calle Salud 456",
        service: "Chequeo General",
        diagnosis: "Sin novedades",
        observations: "Paciente estable.",
        documents: [],
      },
      {
        date: "01 Feb, 2025",
        time: "08:30 AM",
        address: "Calle Salud 456",
        service: "Consulta Nutricional",
        diagnosis: "Sobrepeso leve",
        observations: "Recomendada dieta y ejercicio.",
        documents: [],
      },
    ],
  },
  {
    id: "3",
    doctorId: "d3",
    doctorName: "Santiago Pérez",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "virtual",
    location: hospitals[2],
    status: "in_progress",
    Service: "Consulta Cardiológica",
    Reason: "Seguimiento post-operatorio",
    description: "Seguimiento post-operatorio",
    price: 1000,
    numberOfPatients: 1,
    patientName: "Carlos Méndez",
    history: [
      {
        date: "05 Sep, 2025",
        time: "14:00 PM",
        address: "Hospital Central, Piso 3",
        service: "Cirugía Cardíaca",
        diagnosis: "Bypass coronario exitoso",
        observations: "Recuperación favorable. Control en 30 días.",
        documents: [
          { name: "InformeQuirurgico.pdf", url: "/docs/surgery1.pdf" },
          { name: "AnalisisPreOperatorio.pdf", url: "/docs/preop1.pdf" },
        ],
      },
      {
        date: "20 Ago, 2025",
        time: "10:30 AM",
        address: "Hospital Central, Piso 3",
        service: "Consulta Pre-Operatoria",
        diagnosis: "Obstrucción coronaria severa",
        observations:
          "Paciente candidato para cirugía. Preparación pre-quirúrgica.",
        documents: [
          { name: "Cateterismo.pdf", url: "/docs/cath1.pdf" },
          { name: "ExamenesLaboratorio.xlsx", url: "/docs/labs1.xlsx" },
        ],
      },
      {
        date: "10 Jul, 2025",
        time: "09:00 AM",
        address: "Hospital Central, Piso 3",
        service: "Consulta Cardiológica",
        diagnosis: "Angina de pecho",
        observations: "Dolor torácico recurrente. Se solicita cateterismo.",
        documents: [
          { name: "Electrocardiograma.pdf", url: "/docs/ecg3.pdf" },
          { name: "PruebaEsfuerzo.pdf", url: "/docs/stress1.pdf" },
        ],
      },
    ],
  },
  {
    id: "4",
    doctorId: "d4",
    doctorName: "Dr. Cristoforo Criparni",
    doctorSpecialty: "Ginecología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    description:
      "Consulta virtual para diagnóstico de hipertensión y control de ritmo cardíaco.",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: hospitals[3],
    status: "scheduled",
    Service: "Consulta Ginecológica",
    Reason: "Control de hipertensión",
    price: 1500,
    numberOfPatients: 1,
    patientName: "María Rodríguez",
    history: [
      {
        date: "12 Sep, 2025",
        time: "11:00 AM",
        address: "Clínica Mujer, Consultorio 205",
        service: "Consulta Ginecológica",
        diagnosis: "Control prenatal - segundo trimestre",
        observations: "Embarazo evolutivo normal. Presión arterial elevada.",
        documents: [
          { name: "Ecografia20Semanas.pdf", url: "/docs/echo2.pdf" },
          { name: "AnalisisSangre.pdf", url: "/docs/blood2.pdf" },
          { name: "ControlPresion.xlsx", url: "/docs/bp-log.xlsx" },
        ],
      },
      {
        date: "15 Ago, 2025",
        time: "09:30 AM",
        address: "Clínica Mujer, Consultorio 205",
        service: "Consulta Ginecológica",
        diagnosis: "Control prenatal - primer trimestre",
        observations:
          "Paciente en buen estado. Vitaminas prenatales indicadas.",
        documents: [
          { name: "Ecografia12Semanas.pdf", url: "/docs/echo1.pdf" },
          { name: "PruebaEmbarazo.pdf", url: "/docs/pregnancy-test.pdf" },
        ],
      },
      {
        date: "20 Jul, 2025",
        time: "14:00 PM",
        address: "Clínica Mujer, Consultorio 205",
        service: "Chequeo Ginecológico Anual",
        diagnosis: "Sin alteraciones",
        observations: "Citología normal. Control en 1 año.",
        documents: [
          { name: "ResultadoCitologia.pdf", url: "/docs/pap-smear.pdf" },
        ],
      },
    ],
  },
  {
    id: "5",
    doctorId: "d5",
    doctorName: "Sofía Torres",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: hospitals[4],
    status: "cancelled",
    Service: "Consulta Cardiológica",
    Reason: "Chequeo pre-operatorio",
    description: "Chequeo pre-operatorio",
    price: 1200,
    numberOfPatients: 1,
    patientName: "Pedro Sánchez",
    history: [
      {
        date: "18 Sep, 2025",
        time: "10:00 AM",
        address: "Centro Médico Norte",
        service: "Consulta Cardiológica",
        diagnosis: "Apto para cirugía",
        observations:
          "Función cardíaca normal. Autorizado para procedimiento quirúrgico.",
        documents: [
          {
            name: "EvaluacionCardiacaPreOp.pdf",
            url: "/docs/cardiac-preop.pdf",
          },
          { name: "Ecocardiograma.pdf", url: "/docs/echo-cardiac.pdf" },
        ],
      },
    ],
  },
  {
    id: "6",
    doctorId: "d6",
    doctorName: "Alejandro Díaz",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: hospitals[5],
    status: "completed",
    Service: "Consulta Cardiológica",
    Reason: "Evaluación de arritmia",
    description: "Evaluación de arritmia",
    price: 1200,
    numberOfPatients: 1,
    patientName: "Lucía Fernández",
    history: [
      {
        date: "25 Sep, 2025",
        time: "15:00 PM",
        address: "Hospital del Corazón",
        service: "Monitoreo Holter 24h",
        diagnosis: "Arritmia sinusal leve",
        observations:
          "Episodios esporádicos. No requiere medicación por ahora.",
        documents: [
          { name: "ResultadoHolter.pdf", url: "/docs/holter1.pdf" },
          { name: "GraficasRitmoCardiaco.png", url: "/docs/heart-rhythm.png" },
        ],
      },
      {
        date: "10 Sep, 2025",
        time: "11:30 AM",
        address: "Hospital del Corazón",
        service: "Consulta Cardiológica",
        diagnosis: "Palpitaciones de origen desconocido",
        observations: "Se solicita Holter 24 horas para diagnóstico.",
        documents: [{ name: "ECGReposo.pdf", url: "/docs/ecg-rest.pdf" }],
      },
    ],
  },
  {
    id: "7",
    doctorId: "d7",
    doctorName: "Dra. Laura Méndez",
    doctorSpecialty: "Cardiología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Chequeo Cardiovascular",
    description: "Control rutinario de presión arterial y electrocardiograma.",
    date: "25 Oct, 2025",
    time: "09:00 AM",
    appointmentType: "in_person",
    location: hospitals[6],
    status: "completed",
    Service: "Chequeo Cardiovascular",
    Reason: "Control rutinario",
    price: 1300,
    numberOfPatients: 1,
    patientName: "Miguel Castillo",
  },
  {
    id: "8",
    doctorId: "d8",
    doctorName: "Dr. Roberto García",
    doctorSpecialty: "Medicina General",
    doctorAvatar:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Consulta General",
    date: "20 Oct, 2025",
    time: "14:00 PM",
    appointmentType: "virtual",
    location: hospitals[7],
    status: "cancelled",
    Service: "Consulta General",
    Reason: "Fiebre y malestar general",
    description: "Fiebre y malestar general",
    price: 900,
    numberOfPatients: 1,
    patientName: "Elena Vargas",
  },
  {
    id: "9",
    doctorId: "d9",
    doctorName: "Dr. Pablo Herrera",
    doctorSpecialty: "Dermatología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Consulta Dermatológica",
    date: "30 Oct, 2025",
    time: "11:00 AM",
    appointmentType: "in_person",
    location: hospitals[8],
    status: "scheduled",
    Service: "Consulta Dermatológica",
    Reason: "Revisión de manchas en la piel",
    description: "Revisión de manchas en la piel",
    price: 1100,
    numberOfPatients: 1,
    patientName: "Gabriela Peña",
    history: [
      {
        date: "05 Ago, 2025",
        time: "16:00 PM",
        address: "Clínica DermaSalud",
        service: "Consulta Dermatológica",
        diagnosis: "Dermatitis solar",
        observations: "Protector solar SPF 50+. Evitar exposición directa.",
        documents: [
          { name: "FotografiasLesiones.jpg", url: "/docs/skin-photos.jpg" },
          { name: "RecetaTratamiento.pdf", url: "/docs/prescription-derm.pdf" },
        ],
      },
    ],
  },
  {
    id: "10",
    doctorId: "d10",
    doctorName: "Dra. Carla Jiménez",
    doctorSpecialty: "Pediatría",
    doctorAvatar:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Chequeo Pediátrico",
    date: "31 Oct, 2025",
    time: "09:30 AM",
    appointmentType: "virtual",
    location: hospitals[9],
    status: "pending",
    Service: "Chequeo Pediátrico",
    Reason: "Chequeo de rutina para niño",
    description: "Chequeo de rutina para niño",
    price: 1000,
    numberOfPatients: 1,
    patientName: "Samuel Jiménez",
    history: [
      {
        date: "15 Jul, 2025",
        time: "10:00 AM",
        address: "Centro Pediátrico Infantil",
        service: "Vacunación",
        diagnosis: "Esquema de vacunación al día",
        observations: "Aplicadas vacunas correspondientes a 6 años.",
        documents: [
          { name: "CarnetVacunacion.pdf", url: "/docs/vaccination-card.pdf" },
        ],
      },
      {
        date: "10 May, 2025",
        time: "11:00 AM",
        address: "Centro Pediátrico Infantil",
        service: "Chequeo Pediátrico",
        diagnosis: "Desarrollo normal para la edad",
        observations: "Peso y talla dentro de percentiles normales.",
        documents: [
          { name: "CurvasCrecimiento.pdf", url: "/docs/growth-chart.pdf" },
        ],
      },
      {
        date: "20 Feb, 2025",
        time: "09:00 AM",
        address: "Centro Pediátrico Infantil",
        service: "Consulta por Gripe",
        diagnosis: "Infección respiratoria viral",
        observations: "Tratamiento sintomático. Reposo indicado.",
        documents: [
          { name: "RecetaMedica.pdf", url: "/docs/prescription-ped.pdf" },
        ],
      },
    ],
  },
  {
    id: "11",
    doctorId: "d11",
    doctorName: "Dr. Luis Martínez",
    doctorSpecialty: "Oftalmología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Visual",
    date: "01 Nov, 2025",
    time: "13:00 PM",
    appointmentType: "in_person",
    location: hospitals[10],
    status: "completed",
    Service: "Evaluación Visual",
    Reason: "Molestias en la visión",
    description: "Molestias en la visión",
    price: 1100,
    numberOfPatients: 1,
    patientName: "Valeria Suárez",
    history: [
      {
        date: "22 Sep, 2025",
        time: "14:30 PM",
        address: "Centro Oftalmológico",
        service: "Examen de la Vista",
        diagnosis: "Miopía progresiva",
        observations: "Actualización de lentes. Control en 6 meses.",
        documents: [
          { name: "RecetaLentes.pdf", url: "/docs/glasses-rx.pdf" },
          { name: "ExamenRefraccion.pdf", url: "/docs/refraction-test.pdf" },
        ],
      },
      {
        date: "10 Ago, 2025",
        time: "10:00 AM",
        address: "Centro Oftalmológico",
        service: "Consulta Oftalmológica",
        diagnosis: "Fatiga visual por uso de pantallas",
        observations: "Recomendado descansos visuales cada 20 minutos.",
        documents: [
          {
            name: "RecomendacionesErgonomia.docx",
            url: "/docs/ergonomics.docx",
          },
        ],
      },
    ],
  },
  {
    id: "12",
    doctorId: "d12",
    doctorName: "Dra. Patricia Gómez",
    doctorSpecialty: "Endocrinología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Control de Diabetes",
    date: "02 Nov, 2025",
    time: "15:00 PM",
    appointmentType: "virtual",
    location: hospitals[11],
    status: "cancelled",
    Service: "Control de Diabetes",
    Reason: "Control de glucosa",
    description: "Control de glucosa",
    price: 1200,
    numberOfPatients: 1,
    patientName: "Roberto Díaz",
  },
  {
    id: "13",
    doctorId: "d13",
    doctorName: "Dr. Andrés Castro",
    doctorSpecialty: "Neurología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Consulta Neurológica",
    date: "03 Nov, 2025",
    time: "16:30 PM",
    appointmentType: "in_person",
    location: hospitals[12],
    status: "in_progress",
    Service: "Consulta Neurológica",
    Reason: "Dolores de cabeza frecuentes",
    description: "Dolores de cabeza frecuentes",
    price: 1400,
    numberOfPatients: 1,
    patientName: "Andrea Morales",
    history: [
      {
        date: "28 Sep, 2025",
        time: "17:00 PM",
        address: "Instituto Neurológico",
        service: "Resonancia Magnética",
        diagnosis: "Migraña crónica sin complicaciones",
        observations:
          "Estudio sin hallazgos patológicos. Tratamiento preventivo indicado.",
        documents: [
          { name: "ResonanciaCerebral.pdf", url: "/docs/mri-brain.pdf" },
          { name: "InformeRadiologia.pdf", url: "/docs/radiology-report.pdf" },
        ],
      },
      {
        date: "12 Sep, 2025",
        time: "16:00 PM",
        address: "Instituto Neurológico",
        service: "Consulta Neurológica",
        diagnosis: "Cefalea tensional recurrente",
        observations:
          "Se solicita resonancia magnética para descartar patología.",
        documents: [
          { name: "OrdenResonancia.pdf", url: "/docs/mri-order.pdf" },
        ],
      },
    ],
  },
];
