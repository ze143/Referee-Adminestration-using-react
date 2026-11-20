import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  MapPin,
  Calendar,
  Clock,
  Flag,
  Video,
  Eye,
  AlertTriangle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { supabase } from "@/lib/supabase";
import { formatDate, formatTime } from "@/lib/utils";

// ============================================
// Hook: جلب تفاصيل المباراة
// ============================================
function useMatchDetails(id) {
  return useQuery({
    queryKey: ["match-details", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          competitions!inner(name),
          stage:competition_stages!matches_stage_id_fkey(id, name),
          group:competition_groups!matches_group_id_fkey(id, name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name),
          main_referee:referees!matches_main_referee_id_fkey(id, full_name, degree, region),
          assistant1:referees!matches_assistant1_referee_id_fkey(id, full_name, degree, region),
          assistant2:referees!matches_assistant2_referee_id_fkey(id, full_name, degree, region),
          fourth_referee:referees!matches_fourth_referee_id_fkey(id, full_name, degree, region),
          var_referee:referees!matches_var_referee_id_fkey(id, full_name, degree, region),
          avar_referee:referees!matches_avar_referee_id_fkey(id, full_name, degree, region),
          supervisor:supervisors!matches_supervisor_id_fkey(id, full_name, region),
          video_supervisor:supervisors!matches_video_supervisor_id_fkey(id, full_name, region)
        `,
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// Modal
// ============================================
export default function MatchDetailsModal({ open, onClose, matchId }) {
  const { data: match, isLoading } = useMatchDetails(matchId);

  if (isLoading) {
    return (
      <Modal open={open} onClose={onClose} title="تفاصيل المباراة" size="lg">
        <Spinner size="lg" className="py-16" />
      </Modal>
    );
  }

  if (!match) return null;

  const crew = [
    {
      role: "main",
      label: "رئيسي",
      icon: Flag,
      data: match.main_referee,
      notified: match.main_referee_notified,
      color: "bg-blue-500/20 text-blue-300",
    },
    {
      role: "assistant1",
      label: "مساعد 1",
      icon: Flag,
      data: match.assistant1,
      notified: match.assistant1_notified,
      color: "bg-green-500/20 text-green-300",
    },
    {
      role: "assistant2",
      label: "مساعد 2",
      icon: Flag,
      data: match.assistant2,
      notified: match.assistant2_notified,
      color: "bg-green-500/20 text-green-300",
    },
    {
      role: "fourth",
      label: "رابع",
      icon: Flag,
      data: match.fourth_referee,
      notified: match.fourth_referee_notified,
      color: "bg-yellow-500/20 text-yellow-300",
    },
    {
      role: "var",
      label: "VAR",
      icon: Video,
      data: match.var_referee,
      notified: match.var_referee_notified,
      color: "bg-red-500/20 text-red-300",
    },
    {
      role: "avar",
      label: "AVAR",
      icon: Video,
      data: match.avar_referee,
      notified: match.avar_referee_notified,
      color: "bg-red-500/20 text-red-300",
    },
  ].filter((c) => c.data);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تفاصيل المباراة"
      size="lg"
      footer={
        <button className="btn-secondary" onClick={onClose}>
          إغلاق
        </button>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">
            {match.home_team?.name} <span className="text-red-400 mx-2">×</span>{" "}
            {match.away_team?.name}
          </h3>
          <p className="text-sm text-gold-500">
            {match.competitions?.name}
            {match.stage?.name && ` — ${match.stage.name}`}
            {match.group?.name && ` — ${match.group.name}`}
          </p>
        </div>

        {/* Conflict alert */}
        {match.has_conflict && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-yellow-300">
              هذه المباراة فيها تعارض في التوقيت
            </span>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoBox
            icon={Calendar}
            label="التاريخ"
            value={formatDate(match.match_date)}
          />
          <InfoBox
            icon={Clock}
            label="الوقت"
            value={formatTime(match.match_time)}
          />
          <InfoBox icon={MapPin} label="الملعب" value={match.stadium} />
          <InfoBox
            icon={Trophy}
            label="المجموعة"
            value={match.group?.name || "—"}
          />
        </div>

        {/* Status */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={match.is_notified ? "success" : "warning"}>
            {match.is_notified ? "✅ مبلغ" : "⏳ غير مبلغ"}
          </Badge>
          <Badge variant={match.is_paid ? "success" : "gray"}>
            {match.is_paid ? "💰 مدفوع" : "غير مدفوع"}
          </Badge>
          {match.has_conflict && <Badge variant="danger">⚠️ تعارض</Badge>}
        </div>

        {/* Crew */}
        <div>
          <h4 className="text-sm font-bold text-gold-500 mb-2">طاقم الحكام</h4>
          {crew.length === 0 ? (
            <p className="text-white/40 text-sm">لم يتم التعيين</p>
          ) : (
            <div className="space-y-2">
              {crew.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.role}
                    className={`flex items-center gap-2 p-2 rounded ${c.color}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-bold w-16">{c.label}</span>
                    <span className="flex-1 text-sm truncate">
                      {c.data.full_name}
                    </span>
                    {c.data.region && (
                      <span className="text-xs opacity-60">
                        ({c.data.region})
                      </span>
                    )}
                    <Badge variant={c.notified ? "success" : "gray"} size="sm">
                      {c.notified ? "✓" : "⏳"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Supervisor */}
        {match.supervisor && (
          <div>
            <h4 className="text-sm font-bold text-gold-500 mb-2">مراقب الحكام</h4>
            <div className="flex items-center gap-2 p-2 rounded bg-purple-500/20 text-purple-300">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{match.supervisor.full_name}</span>
            </div>
          </div>
        )}

        {/* Video Supervisor */}
        {match.video_supervisor && (
          <div>
            <h4 className="text-sm font-bold text-gold-500 mb-2">
              مراقب الفيديو
            </h4>
            <div className="flex items-center gap-2 p-2 rounded bg-red-500/20 text-red-300">
              <Video className="w-4 h-4" />
              <span className="text-sm">
                {match.video_supervisor.full_name}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {match.notes && (
          <div>
            <h4 className="text-sm font-bold text-gold-500 mb-2">ملاحظات</h4>
            <p className="text-sm text-white/70 bg-white/5 p-3 rounded">
              {match.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================
// Helper
// ============================================
function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 rounded p-2 text-center">
      <Icon className="w-4 h-4 text-gold-500 mx-auto mb-1" />
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-sm text-white truncate">{value || "—"}</p>
    </div>
  );
}