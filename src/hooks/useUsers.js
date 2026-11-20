import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// ============================================
// جلب المستخدمين
// ============================================
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // 1. جلب profiles
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (profErr) throw profErr

      // 2. جلب editor_permissions
      const { data: perms, error: permErr } = await supabase
        .from('editor_permissions')
        .select('*')
      if (permErr) throw permErr

      // 3. دمج
      return profiles.map((p) => ({
        ...p,
        editor_permissions: (perms || []).filter((perm) => perm.user_id === p.id),
      }))
    },
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// إنشاء مستخدم (عبر Edge Function)
// ============================================
export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, password, full_name, role }) => {
      // 1. جلب الجلسة الحالية (للتحقق من الأدمن)
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

      if (sessionErr || !session) {
        throw new Error('غير مصرح — يجب تسجيل الدخول كأدمن')
      }

      // 2. استدعاء Edge Function
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password, full_name, role }),
        }
      )

      // 3. تحليل الرد
      let result
      try {
        result = await res.json()
      } catch {
        result = { error: `فشل الاتصال (${res.status})` }
      }

      if (!res.ok) {
        throw new Error(result.error || `فشل إنشاء المستخدم (${res.status})`)
      }

      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('تم إنشاء المستخدم بنجاح')
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ في إنشاء المستخدم')
    },
  })
}

// ============================================
// تعديل الدور والاسم
// ============================================
export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role, full_name }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role, full_name })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('تم تحديث المستخدم')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

// ============================================
// حذف مستخدم
// ============================================
export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('تم حذف المستخدم')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

// ============================================
// صلاحيات المحرر — جلب
// ============================================
export function useEditorPermissions(userId) {
  return useQuery({
    queryKey: ['editor-permissions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editor_permissions')
        .select(`
          *,
          competitions(id, name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!userId,
  })
}

// ============================================
// صلاحيات المحرر — منح
// ============================================
export function useGrantPermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ user_id, competition_id, assigned_date, permission_type }) => {
      const { error } = await supabase.from('editor_permissions').insert([
        {
          user_id,
          competition_id: competition_id || null,
          assigned_date: assigned_date || null,
          permission_type,
        },
      ])
      if (error) throw error
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['editor-permissions', vars.user_id] })
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('تم منح الصلاحية')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

// ============================================
// صلاحيات المحرر — إزالة
// ============================================
export function useRevokePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { error } = await supabase.from('editor_permissions').delete().eq('id', id)
      if (error) throw error
      return { userId }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['editor-permissions', data.userId] })
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('تم إزالة الصلاحية')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}