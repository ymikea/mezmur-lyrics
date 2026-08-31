import { LITURGICAL_SEASONS, LiturgicalSeason, Mezmur } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import PublicLibraryBrowser from '@/components/PublicLibraryBrowser';

export const revalidate = 60;

interface PublicLibraryPageProps {
  searchParams: Promise<{ reason?: string; season?: LiturgicalSeason }>;
}

export default async function PublicLibraryPage({ searchParams }: PublicLibraryPageProps) {
  const { reason, season } = await searchParams;
  const defaultSeason: LiturgicalSeason =
    season && LITURGICAL_SEASONS.includes(season) ? season : 'General';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="container">
        <h1 className="page-title">Mezmur Library</h1>
        <p className="page-subtitle">
          Configure Supabase environment variables to load approved mezmurs.
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: mezmurs } = await supabase
    .from('mezmurs')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const typedMezmurs = (mezmurs as Mezmur[]) || [];

  return (
    <main className="container">
      <h1 className="page-title">Mezmur Library</h1>
      <p className="page-subtitle">
        Browse approved hymns, submit a new mezmur, or review submissions if you are staff.
      </p>

      {reason === 'unauthorized' && (
        <p className="banner banner--error">
          You do not have permission to access that page.
        </p>
      )}

      <PublicLibraryBrowser mezmurs={typedMezmurs} defaultSeason={defaultSeason} />
    </main>
  );
}
