'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { ReviewStatus } from '@/types/database';

const ensureStaff = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!roleRow?.role || !['admin', 'moderator'].includes(roleRow.role)) {
    throw new Error('Unauthorized');
  }

  return { supabase, role: roleRow.role as 'admin' | 'moderator' };
};

export async function updateMezmurStatus(id: string, status: ReviewStatus) {
  const { supabase } = await ensureStaff();

  const { error } = await supabase
    .from('mezmurs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteMezmur(id: string) {
  const { supabase, role } = await ensureStaff();

  if (role !== 'admin') {
    throw new Error('Only admins can delete mezmurs.');
  }

  const { error } = await supabase.from('mezmurs').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}
