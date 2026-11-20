import { create } from "zustand";
import { supabase } from "@/lib/supabase";

// ============================================
// Auth Store — نسخة محسّنة للسرعة والاعتمادية
// ============================================

let authListenerInitialized = false;

export const useAuthStore = create((set, get) => ({
  // ====== State ======
  user: null,
  profile: null,
  loading: true,
  initialized: false, // ← جديد: هل تم التهيئة؟
  error: null,

  // ====== Initialize ======
  initialize: async () => {
    // ✅ منع التكرار
    if (get().initialized) {
      console.log("🔍 [AUTH] Already initialized");
      return;
    }

    try {
      console.log("🔍 [AUTH] Starting initialize...");

      // ✅ جلب الجلسة الحالية
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ [AUTH] Session error:", sessionError);
        set({ loading: false, initialized: true, error: sessionError.message });
        return;
      }

      if (session?.user) {
        console.log("✅ [AUTH] Session found:", session.user.email);

        // ✅ جلب الـ profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("❌ [AUTH] Profile error:", profileError);
          // ⚠️ مش بنفشل — المستخدم موجود بس profile ناقص
          set({
            user: session.user,
            profile: null,
            loading: false,
            initialized: true,
            error: "Profile not found",
          });
        } else {
          console.log("✅ [AUTH] Profile loaded:", profile.role);
          set({
            user: session.user,
            profile,
            loading: false,
            initialized: true,
            error: null,
          });
        }
      } else {
        console.log("🔍 [AUTH] No session");
        set({
          user: null,
          profile: null,
          loading: false,
          initialized: true,
        });
      }

      // ✅ تسجيل onAuthStateChange مرة واحدة بس
      if (!authListenerInitialized) {
        authListenerInitialized = true;
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("🔍 [AUTH] onAuthStateChange:", event);

          if (event === "SIGNED_OUT") {
            set({ user: null, profile: null });
            return;
          }

          if (session?.user) {
            // جلب الـ profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            set({ user: session.user, profile: profile || null });
          }
        });
      }
    } catch (error) {
      console.error("❌ [AUTH] Initialize error:", error);
      set({
        loading: false,
        initialized: true,
        error: error.message,
      });
    }
  },

  // ====== Login ======
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // ✅ جلب profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw new Error("لم يتم العثور على بيانات المستخدم");

    // ✅ تحديث الـ state
    set({ user: data.user, profile, loading: false, initialized: true });

    return data;
  },

  // ====== Logout ======
  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        profile: null,
        loading: false,
        initialized: false, // ← نعيد التهيئة
      });
      authListenerInitialized = false;
    } catch (error) {
      console.error("❌ [AUTH] Logout error:", error);
    }
  },

  // ====== Helpers ======
  getRole: () => get().profile?.role,
  isAdmin: () => get().profile?.role === "admin",
  isEditor: () => get().profile?.role === "editor",
  isViewer: () => get().profile?.role === "viewer",

  // ====== Refetch profile (لو اتغير من مكان تاني) ======
  refetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      set({ profile });
    }
  },
}));
