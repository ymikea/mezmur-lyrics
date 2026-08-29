import { redirect } from 'next/navigation';
import { Mezmur } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import AdminTable from './AdminTable';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!roleRow || !['admin', 'moderator'].includes(roleRow.role)) {
    redirect('/');
  }

  const { data } = await supabase
    .from('mezmurs')
    .select('*')
    .order('created_at', { ascending: false });

  const mezmurs = (data as Mezmur[]) || [];

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p style={{ marginTop: 8 }}>Review, approve, reject, or delete submitted mezmurs.</p>
      {mezmurs.length === 0 ? (
        <p style={{ marginTop: 12 }}>No submissions yet.</p>
      ) : (
        <AdminTable mezmurs={mezmurs} canDelete={roleRow.role === 'admin'} />
      )}
    </main>
  );
}
