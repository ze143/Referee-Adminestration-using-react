import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Cake,
  Star,
  Briefcase,
  Video,
  Phone,
  Home,
  Ban,
  Trophy,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import { DEGREES, JOBS, getLabel } from "@/types/constants";
import { formatDate, calculateAge } from "@/lib/utils";
import RefereeEvaluationsSection from "./RefereeEvaluationsSection";

// ============================================
// Hook: جلب تفاصيل الحكم
// ============================================
function useRefereeDetails(id) {
  return useQuery({
    queryKey: ["referee-details", id],
    queryFn: async () => {
      const { data: referee, error: refErr } = await supabase
        .from("referees")
        .select("*")
        .eq("id", id)
        .single();
      if (refErr) throw refErr;

      const { data: matches, error: mErr } = await supabase
        .from("matches")
        .select(
          `
          *,
          competitions!inner(name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `,
        )
        .or(
          `main_referee_id.eq.${id},fourth_referee_id.eq.${id},assistant1_referee_id.eq.${id},assistant2_referee_id.eq.${id},var_referee_id.eq.${id},avar_referee_id.eq.${id}`,
        )
        .order("match_date", { ascending: false });
      if (mErr) throw mErr;

      const { data: excuses, error: eErr } = await supabase
        .from("referee_excuses")
        .select("*")
        .eq("referee_id", id)
        .order("excuse_date", { ascending: false });
      if (eErr) throw eErr;

      const { data: suspensions, error: sErr } = await supabase
        .from("suspensions_history")
        .select("*")
        .eq("referee_id", id)
        .order("start_date", { ascending: false });
      if (sErr) throw sErr;

      const { data: evaluations, error: evErr } = await supabase
        .from("match_evaluations")
        .select("*")
        .eq("referee_id", id);
      if (evErr) throw evErr;

      const totalMatches = matches?.length || 0;
      const mainCount = matches?.filter((m) => m.main_referee_id === id).length || 0;
      const asstCount = matches?.filter(
        (m) => m.assistant1_referee_id === id || m.assistant2_referee_id === id,
      ).length || 0;
      const fourthCount = matches?.filter((m) => m.fourth_referee_id === id).length || 0;
      const varCount = matches?.filter(
        (m) => m.var_referee_id === id || m.avar_referee_id === id,
      ).length || 0;

      const byCompetition = {};
      matches?.forEach((m) => {
        const name = m.competitions?.name || "غير محدد";
        byCompetition[name] = (byCompetition[name] || 0) + 1;
      });

      // متوسط التقييم (بدون الحكم الرابع)
      const countedEvals = evaluations?.filter((e) => e.referee_role !== "fourth") || [];
      const avgRating =
        countedEvals.length > 0
          ? (countedEvals.reduce((s, e) => s + e.rating, 0) / countedEvals.length).toFixed(1)
          : "-";

      return {
        referee,
        matches: matches || [],
        excuses: excuses || [],
        suspensions: suspensions || [],
        evaluations: evaluations || [],
        stats: {
          totalMatches,
          mainCount,
          asstCount,
          fourthCount,
          varCount,
          byCompetition,
          avgRating,
          evaluatedCount: countedEvals.length,
        },
      };
    },
    enabled: !!id,
  });
}

// ============================================
// المكون الرئيسي
// ============================================
export default function RefereeDetailsModal({ open, onClose, refereeId }) {
  const { data, isLoading } = useRefereeDetails(refereeId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تفاصيل الحكم"
      size="full"
      footer={
        <button className="btn-secondary" onClick={onClose}>
          إغلاق
        </button>
      }
    >
      {isLoading ? (
        <Spinner size="lg" className="py-16" />
      ) : !data ? (
        <EmptyState title="الحكم غير موجود" />
      ) : (
        <RefereeDetails data={data} />
      )}
    </Modal>
  );
}

// ============================================
// عرض التفاصيل
// ============================================
function RefereeDetails({ data }) {
  const { referee, matches, excuses, suspensions, stats } = data;

  const age = calculateAge(referee.birth_date);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* ========== العمود الأول: معلومات شخصية ========== */}
      <div className="lg:col-span-1 space-y-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-brand flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {referee.full_name?.charAt(0) || "?"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{referee.full_name}</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant={referee.is_suspended ? "danger" : "success"}>
              {referee.is_suspended ? "موقوف" : "نشط"}
            </Badge>
            <Badge variant="gold">{getLabel(DEGREES, referee.degree)}</Badge>
          </div>
          {referee.is_suspended && referee.suspension_until && (
            <p className="text-yellow-400 text-xs mt-2">
              إيقاف حتى {formatDate(referee.suspension_until)}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <InfoRow icon={MapPin} label="المنطقة" value={referee.region || "-"} />
          <InfoRow
            icon={Cake}
            label="العمر"
            value={age !== "-" ? `${age} سنة` : "-"}
          />
          <InfoRow
            icon={Calendar}
            label="تاريخ الميلاد"
            value={formatDate(referee.birth_date)}
          />
          <InfoRow icon={Briefcase} label="الوظيفة" value={getLabel(JOBS, referee.job)} />
          <InfoRow
            icon={Video}
            label="صلاحيات VAR"
            value={
              referee.has_var_license || referee.has_avar_license ? (
                <div className="flex gap-1">
                  {referee.has_var_license && (
                    <Badge variant="danger" size="sm">
                      VAR
                    </Badge>
                  )}
                  {referee.has_avar_license && (
                    <Badge variant="warning" size="sm">
                      AVAR
                    </Badge>
                  )}
                </div>
              ) : (
                "لا يوجد"
              )
            }
          />
          <InfoRow icon={Phone} label="الهاتف" value={referee.phone || "-"} />
          <InfoRow icon={Home} label="العنوان" value={referee.address || "-"} />
          {referee.is_suspended && (
            <InfoRow
              icon={Ban}
              label="سبب الإيقاف"
              value={referee.suspension_reason || "-"}
              valueClass="text-red-400"
            />
          )}
        </div>
      </div>

      {/* ========== العمود الثاني: إحصائيات ========== */}
      <div className="lg:col-span-2 space-y-6">
        {/* إحصائيات المباريات */}
        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            إحصائيات المباريات
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="إجمالي" value={stats.totalMatches} color="text-white" />
            <StatBox label="رئيسي" value={stats.mainCount} color="text-blue-400" />
            <StatBox label="مساعد" value={stats.asstCount} color="text-green-400" />
            <StatBox label="رابع" value={stats.fourthCount} color="text-yellow-400" />
          </div>
          {stats.varCount > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <StatBox label="VAR/AVAR" value={stats.varCount} color="text-red-400" />
              <StatBox
                label="متوسط التقييم"
                value={stats.avgRating}
                color="text-gold-500"
                subtitle={`(${stats.evaluatedCount} تقييم)`}
              />
            </div>
          )}
        </div>

        {/* المباريات حسب المسابقة */}
        {Object.keys(stats.byCompetition).length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gold-500 mb-3">
              المباريات حسب المسابقة
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(stats.byCompetition).map(([name, count]) => (
                <div
                  key={name}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="text-2xl font-bold text-gold-500">{count}</div>
                  <div className="text-xs text-white/60 mt-1 truncate" title={name}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* آخر المباريات */}
        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3">آخر المباريات</h4>
          {matches.length === 0 ? (
            <EmptyState title="لا توجد مباريات" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right py-2 text-gold-500 font-semibold">التاريخ</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">المسابقة</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">المضيف</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">الضيف</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">الدور</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 5).map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2">{formatDate(m.match_date)}</td>
                      <td className="py-2 text-white/80">{m.competitions?.name || "-"}</td>
                      <td className="py-2">{m.home_team?.name || "-"}</td>
                      <td className="py-2">{m.away_team?.name || "-"}</td>
                      <td className="py-2">
                        <RoleBadge refereeId={referee.id} match={m} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 5 && (
                <p className="text-center text-white/40 text-xs mt-2">
                  عرض 5 من أصل {matches.length} مباراة
                </p>
              )}
            </div>
          )}
        </div>

        {/* ✅ سجل التقييمات — جديد */}
        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            التقييمات
          </h4>
          <RefereeEvaluationsSection refereeId={referee.id} />
        </div>

        {/* سجل الأعذار */}
        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            سجل الأعذار ({excuses.length})
          </h4>
          {excuses.length === 0 ? (
            <p className="text-white/40 text-sm">لا توجد أعذار مسجلة</p>
          ) : (
            <div className="space-y-2">
              {excuses.map((e) => (
                <div
                  key={e.id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm">{e.reason}</p>
                    <p className="text-xs text-white/40">{formatDate(e.excuse_date)}</p>
                  </div>
                  <Badge
                    variant={
                      e.status === "accepted"
                        ? "success"
                        : e.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {e.status === "accepted"
                      ? "مقبول"
                      : e.status === "pending"
                        ? "قيد الانتظار"
                        : "مرفوض"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* سجل الإيقافات */}
        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3 flex items-center gap-2">
            <Ban className="w-5 h-5" />
            سجل الإيقافات ({suspensions.length})
          </h4>
          {suspensions.length === 0 ? (
            <p className="text-white/40 text-sm">لا يوجد سجل إيقافات</p>
          ) : (
            <div className="space-y-2">
              {suspensions.map((s) => (
                <div
                  key={s.id}
                  className="bg-red-500/10 rounded-lg p-3 border border-red-500/20"
                >
                  <p className="text-sm text-red-300">{s.reason}</p>
                  <p className="text-xs text-white/40 mt-1">
                    من {formatDate(s.start_date)} إلى {formatDate(s.end_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// مكونات مساعدة
// ============================================
function InfoRow({ icon: Icon, label, value, valueClass = "text-white/80" }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
      <Icon className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        <div className={`text-sm ${valueClass} break-words`}>{value}</div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = "text-white", subtitle }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/60 mt-1">{label}</div>
      {subtitle && <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>}
    </div>
  );
}

function RoleBadge({ refereeId, match }) {
  let role = null;
  if (match.main_referee_id === refereeId)
    role = { label: "رئيسي", variant: "primary" };
  else if (match.assistant1_referee_id === refereeId)
    role = { label: "مساعد 1", variant: "success" };
  else if (match.assistant2_referee_id === refereeId)
    role = { label: "مساعد 2", variant: "success" };
  else if (match.fourth_referee_id === refereeId)
    role = { label: "رابع", variant: "warning" };
  else if (match.var_referee_id === refereeId)
    role = { label: "VAR", variant: "danger" };
  else if (match.avar_referee_id === refereeId)
    role = { label: "AVAR", variant: "danger" };

  if (!role) return <span className="text-white/40">-</span>;
  return (
    <Badge variant={role.variant} size="sm">
      {role.label}
    </Badge>
  );
}