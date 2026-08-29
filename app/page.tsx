import Link from 'next/link';
import { Mezmur, LiturgicalSeason } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import SeasonSidebar from '@/components/SeasonSidebar';

export const revalidate = 60;

interface PublicLibraryPageProps {
  searchParams: Promise<{ reason?: string; season?: LiturgicalSeason }>;
}

export default async function PublicLibraryPage({ searchParams }: PublicLibraryPageProps) {
  const { reason, season } = await searchParams;

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

  let query = supabase.from('mezmurs').select('*').order('created_at', { ascending: false });
  if (season) {
    query = query.eq('liturgical_season', season);
  }
  const { data: mezmurs } = await query;

  const typedMezmurs = (mezmurs as Mezmur[]) || [];

  return (
    <div className="library-layout">
      <SeasonSidebar activeSeason={season} />
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

        <section className="card-list">
          {typedMezmurs.length === 0 ? (
            <p>No approved mezmurs are available yet.</p>
          ) : (
            typedMezmurs.map((mezmur) => (
              <Link key={mezmur.id} href={`/mezmur/${mezmur.id}`} className="card">
                <h2 className="card__title">{mezmur.title}</h2>
              </Link>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
