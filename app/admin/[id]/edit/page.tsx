import { notFound, redirect } from 'next/navigation';
import { Mezmur } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import EditMezmurForm from './EditMezmurForm';

interface EditMezmurPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMezmurPage({ params }: EditMezmurPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/admin/${id}/edit&reason=login_required`);
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!roleRow || !['admin', 'moderator'].includes(roleRow.role)) {
    redirect('/?reason=unauthorized');
  }

  const { data } = await supabase.from('mezmurs').select('*').eq('id', id).maybeSingle();
  const mezmur = data as Mezmur | null;

  if (!mezmur) {
    notFound();
  }

  return (
    <main className="container">
      <h1 className="page-title">Edit Mezmur</h1>
      <EditMezmurForm mezmur={mezmur} />
    </main>
  );
}
