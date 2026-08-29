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
    redirect('/login?redirect=/admin&reason=login_required');
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!roleRow || !['admin', 'moderator'].includes(roleRow.role)) {
    redirect('/?reason=unauthorized');
  }

  const { data } = await supabase
    .from('mezmurs')
    .select('*')
    .order('created_at', { ascending: false });

  const mezmurs = (data as Mezmur[]) || [];

  return (
    <main className="container">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Review, approve, reject, or delete submitted mezmurs.</p>
      {mezmurs.length === 0 ? (
        <p style={{ marginTop: 16 }}>No submissions yet.</p>
      ) : (
        <AdminTable mezmurs={mezmurs} canDelete={roleRow.role === 'admin'} />
      )}
    </main>
  );
}
