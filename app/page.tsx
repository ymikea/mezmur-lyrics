import Link from 'next/link';
import { Mezmur } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 60;

export default async function PublicLibraryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h1>Mezmur Library</h1>
        <p style={{ marginTop: 8 }}>
          Configure Supabase environment variables to load approved mezmurs.
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: mezmurs } = await supabase
    .from('mezmurs')
    .select('*')
    .order('created_at', { ascending: false });

  const typedMezmurs = (mezmurs as Mezmur[]) || [];

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Mezmur Library</h1>
      <p style={{ marginTop: 8 }}>
        Browse approved hymns, submit a new mezmur, or review submissions if you are staff.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link href="/submit">Submit Mezmur</Link>
        <Link href="/admin">Admin Dashboard</Link>
      </div>

      <section style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {typedMezmurs.length === 0 ? (
          <p>No approved mezmurs are available yet.</p>
        ) : (
          typedMezmurs.map((mezmur) => (
            <article key={mezmur.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <h2>{mezmur.title}</h2>
              <p>Artist: {mezmur.artist}</p>
              <p>
                Language: {mezmur.language} • Season: {mezmur.liturgical_season}
              </p>
              <p style={{ marginTop: 8 }}>Stanzas: {mezmur.lyrics?.length ?? 0}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
