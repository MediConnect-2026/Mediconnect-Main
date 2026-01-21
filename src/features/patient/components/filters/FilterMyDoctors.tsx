import { Heart, Star } from "lucide-react";

import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { type JSX } from "react";
import { type DoctorFiltersSlice } from "@/stores/filters/doctorFilters.slice";

type OptionType = { value: string; label: string | JSX.Element };

const specialties: OptionType[] = [
  { value: "cardiology", label: "Cardiología" },
  { value: "dermatology", label: "Dermatología" },
  { value: "pediatrics", label: "Pediatría" },
  // ...otras especialidades
];

const languages: OptionType[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "fr", label: "Francés" },
  // ...otros idiomas
];

const insurances: OptionType[] = [
  { value: "senasa", label: "SeNaSa" },
  { value: "palic", label: "ARS Palic" },
  { value: "humano", label: "Humano Seguros" },
  // ...otros seguros
];

const experienceOptions: OptionType[] = [
  { value: "1", label: "1+ años" },
  { value: "3", label: "3+ años" },
  { value: "5", label: "5+ años" },
  { value: "10", label: "10+ años" },
];

const rankingOptions: OptionType[] = [
  {
    value: "4.5",
    label: (
      <span className="flex items-center gap-1">
        Mayor a 4.5 <Star className="w-4 h-4 text-yellow-400" />
      </span>
    ),
  },
  {
    value: "4",
    label: (
      <span className="flex items-center gap-1">
        Mayor a 4 <Star className="w-4 h-4 text-yellow-400" />
      </span>
    ),
  },
  {
    value: "3.5",
    label: (
      <span className="flex items-center gap-1">
        Mayor a 3.5 <Star className="w-4 h-4 text-yellow-400" />
      </span>
    ),
  },
  {
    value: "3",
    label: (
      <span className="flex items-center gap-1">
        Mayor a 3 <Star className="w-4 h-4 text-yellow-400" />
      </span>
    ),
  },
  { value: "0", label: <span className="flex items-center gap-1">Todos</span> },
];

type DoctorFiltersProps = {
  doctorFilters: DoctorFiltersSlice["doctorFilters"];
  setDoctorFilters: DoctorFiltersSlice["setDoctorFilters"];
};

function FilterMyDoctors({
  doctorFilters,
  setDoctorFilters,
}: DoctorFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
      <MCFilterSelect
        name="specialty"
        label="Especialidad"
        options={specialties}
        value={doctorFilters.specialty}
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            specialty: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />
      <MCFilterSelect
        name="languages"
        label="Idiomas"
        options={languages}
        multiple
        searchable
        value={doctorFilters.languages}
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            languages: Array.isArray(v) ? v : [v],
          })
        }
      />
      <MCFilterSelect
        name="acceptingInsurance"
        label="Seguros aceptados"
        options={insurances}
        multiple
        searchable
        value={doctorFilters.acceptingInsurance}
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            acceptingInsurance: Array.isArray(v) ? v : [v],
          })
        }
      />
      <MCFilterSelect
        name="yearsOfExperience"
        label="Años de experiencia"
        options={experienceOptions}
        value={
          doctorFilters.yearsOfExperience !== null
            ? String(doctorFilters.yearsOfExperience)
            : ""
        }
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            yearsOfExperience: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />
      <MCFilterSelect
        name="rating"
        label="Ranking mínimo"
        options={rankingOptions}
        value={
          doctorFilters.rating !== null ? String(doctorFilters.rating) : "0"
        }
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            rating: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />
      <div className="flex items-center gap-2">
        <Switch
          checked={doctorFilters.isFavorite === true}
          onCheckedChange={(v) =>
            setDoctorFilters({
              ...doctorFilters,
              isFavorite: v ? true : null,
            })
          }
          id="only-favorites"
        />
        <Label
          htmlFor="only-favorites"
          className="text-primary flex items-center gap-2 cursor-pointer"
        >
          Solo favoritos <Heart className="w-5 h-5 text-red-500" fill="red" />
        </Label>
      </div>
    </div>
  );
}

export default FilterMyDoctors;
