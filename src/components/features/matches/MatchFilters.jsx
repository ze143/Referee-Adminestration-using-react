import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";
import { useCompetitions } from "@/hooks/useCompetitions";
import { useStages } from "@/hooks/useStages";

const STATUS_OPTIONS = [
  { value: "", label: "جميع المباريات" },
  { value: "upcoming", label: "قادمة" },
  { value: "past", label: "منتهية" },
];

const NOTIFIED_OPTIONS = [
  { value: "", label: "الكل" },
  { value: "notified", label: "مبلغ عنها" },
  { value: "not_notified", label: "غير مبلغ" },
];

export default function MatchFilters({ filters, onChange, onReset }) {
  const { data: competitions = [] } = useCompetitions();
  const { data: stages = [] } = useStages(filters.competition_id);

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const hasFilters =
    filters.competition_id !== "" ||
    filters.stage_id !== "" ||
    filters.date !== "" ||
    filters.status !== "upcoming" ||
    filters.notified !== "";

  const competitionOptions = competitions.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const stageOptions = stages.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Select
          value={filters.competition_id || ""}
          onChange={(v) => update("competition_id", v)}
          placeholder="جميع المسابقات"
          searchable
          clearable
          options={competitionOptions}
        />

        <Select
          value={filters.stage_id || ""}
          onChange={(v) => update("stage_id", v)}
          placeholder="جميع المراحل"
          clearable
          disabled={!filters.competition_id}
          options={stageOptions}
        />

        <Input
          type="date"
          value={filters.date || ""}
          onChange={(e) => update("date", e.target.value)}
        />

        <Select
          value={filters.status || ""}
          onChange={(v) => update("status", v)}
          options={STATUS_OPTIONS}
        />

        <Select
          value={filters.notified || ""}
          onChange={(v) => update("notified", v)}
          options={NOTIFIED_OPTIONS}
        />
      </div>

      {hasFilters && (
        <div className="flex justify-end mt-3">
          <Button variant="ghost" size="sm" icon={X} onClick={onReset}>
            مسح الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}
