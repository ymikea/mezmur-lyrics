import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mezmur } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import { renderStanzaText } from '@/utils/lyrics';

interface MezmurDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MezmurDetailPage({ params }: MezmurDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from('mezmurs').select('*').eq('id', id).maybeSingle();

  const mezmur = data as Mezmur | null;

  if (!mezmur) {
    notFound();
  }

  const stanzas = [...mezmur.lyrics].sort((a, b) => a.stanza_order - b.stanza_order);

  return (
    <main className="container">
      <Link href="/" className="nav__link" style={{ paddingLeft: 0 }}>
        ← Back to library
      </Link>

      <h1 className="page-title" style={{ marginTop: 12 }}>
        {mezmur.title}
      </h1>
      <p className="card__meta">
        {mezmur.language} • {mezmur.liturgical_season}
      </p>

      <section className="card" style={{ marginTop: 24 }}>
        {stanzas.map((stanza, index) => (
          <div
            key={index}
            className={`stanza${stanza.is_chorus ? ' stanza--chorus' : ''}`}
          >
            <p>{renderStanzaText(stanza.text)}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
