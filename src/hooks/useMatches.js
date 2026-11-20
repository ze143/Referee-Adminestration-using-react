import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const PAGE_SIZE = 20;

// ============================================
// جلب المباريات (مع Pagination + فلترة)
// ============================================
export function useMatches({
  page = 0,
  filters = {},
  pageSize = PAGE_SIZE,
} = {}) {
  return useQuery({
    queryKey: ["matches", page, filters],
    queryFn: async () => {
      let query = supabase
        .from("matches")
        .select(
          `
          id, competition_id, stage_id, group_id, home_team_id, away_team_id, stadium,
          match_date, match_time, notes,
          main_referee_id, assistant1_referee_id, assistant2_referee_id,
          fourth_referee_id, var_referee_id, avar_referee_id, supervisor_id,
          main_referee_notified, assistant1_notified, assistant2_notified,
          fourth_referee_notified, var_referee_notified, avar_referee_notified,
          is_notified, is_paid, has_conflict,
          competitions!inner(name),
          stage:competition_stages!matches_stage_id_fkey(id, name),
          group:competition_groups!matches_group_id_fkey(id, name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name),
          main_referee:referees!matches_main_referee_id_fkey(id, full_name),
          assistant1:referees!matches_assistant1_referee_id_fkey(id, full_name),
          assistant2:referees!matches_assistant2_referee_id_fkey(id, full_name),
          fourth_referee:referees!matches_fourth_referee_id_fkey(id, full_name),
          var_referee:referees!matches_var_referee_id_fkey(id, full_name),
          avar_referee:referees!matches_avar_referee_id_fkey(id, full_name),
          supervisor:supervisors!matches_supervisor_id_fkey(id, full_name, is_video_supervisor),
  video_supervisor:supervisors!matches_video_supervisor_id_fkey(id, full_name)
        `,
          { count: "exact" },
        )
        .order("match_date", { ascending: false })
        .order("match_time", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filters.competition_id)
        query = query.eq("competition_id", filters.competition_id);
      if (filters.stage_id) query = query.eq("stage_id", filters.stage_id);
      if (filters.group_id) query = query.eq("group_id", filters.group_id);
      if (filters.date) query = query.eq("match_date", filters.date);

      if (filters.status === "upcoming") {
        const today = new Date().toISOString().split("T")[0];
        query = query.gte("match_date", today);
      } else if (filters.status === "past") {
        const today = new Date().toISOString().split("T")[0];
        query = query.lt("match_date", today);
      }

      if (filters.notified === "notified")
        query = query.eq("is_notified", true);
      if (filters.notified === "not_notified")
        query = query.eq("is_notified", false);

      if (filters.home_team_id)
        query = query.eq("home_team_id", filters.home_team_id);
      if (filters.away_team_id)
        query = query.eq("away_team_id", filters.away_team_id);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    },
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });
}

// ============================================
// جلب مباراة واحدة
// ============================================
export function useMatch(id) {
  return useQuery({
    queryKey: ["matches", id],
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
          supervisor:supervisors!matches_supervisor_id_fkey(id, full_name, region)
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
// إضافة مباراة واحدة
// ============================================
export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from("matches")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("تم إضافة المباراة");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });
}

// ============================================
// إضافة مباريات متعددة (bulk)
// ============================================
export function useCreateMatchesBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchesArray) => {
      const { data, error } = await supabase
        .from("matches")
        .insert(matchesArray)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success(`تم إضافة ${data.length} مباراة`);
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });
}

// ============================================
// تعديل مباراة
// ============================================
export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: result, error } = await supabase
        .from("matches")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("تم تحديث المباراة");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });
}

// ============================================
// حذف مباراة
// ============================================
export function useDeleteMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("تم حذف المباراة");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });
}

// ============================================
// Toggle التبليغ
// ============================================
const NOTIFY_COLUMNS = {
  main: "main_referee_notified",
  assistant1: "assistant1_notified",
  assistant2: "assistant2_notified",
  fourth: "fourth_referee_notified",
  var: "var_referee_notified",
  avar: "avar_referee_notified",
};

export function useToggleNotify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, role, currentValue }) => {
      const column = NOTIFY_COLUMNS[role];
      if (!column) throw new Error("دور غير صالح");
      const { error } = await supabase
        .from("matches")
        .update({ [column]: !currentValue })
        .eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success(vars.currentValue ? "تم إلغاء التبليغ" : "تم التبليغ");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });
}

// ============================================
// تعيين الطاقم لعدة مباريات
// ============================================
export function useAssignCrewBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const results = await Promise.all(
        payload.map((item) => {
          const { id, ...data } = item;
          return supabase.from("matches").update(data).eq("id", id);
        }),
      );
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(
          `فشل تحديث ${errors.length} مباراة: ${errors[0].error.message}`,
        );
      }
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("تم حفظ التعيينات");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });
}
