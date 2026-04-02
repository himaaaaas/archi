import { supabase } from './supabase.js'

export async function savePalette(userId, title, params, result) {
  const { data, error } = await supabase
    .from('palettes')
    .insert({
  user_id: userId,
  title,
  params,
  result,
})
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadPalettes(userId) {
  const { data, error } = await supabase
    .from('palettes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deletePalette(id) {
  const { error } = await supabase
    .from('palettes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
