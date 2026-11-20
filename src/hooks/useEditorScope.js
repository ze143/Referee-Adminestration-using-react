import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useEditorScope() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['editor-scope', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('editor_permissions')
        .select(`
          *,
          competitions(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error

      if (!data || data.length === 0) return null

      // ✅ اختر الصلاحية الأحدث
      return data[0]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}