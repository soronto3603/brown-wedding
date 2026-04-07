export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const supabase = useSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return navigateTo('/')

  const { data } = await supabase
    .from('bw_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!data || data.role !== 'admin') return navigateTo('/')
})
