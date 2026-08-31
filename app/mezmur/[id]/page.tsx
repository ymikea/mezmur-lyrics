import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LANGUAGES, Language, Mezmur } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import MezmurLanguageTabs from '@/components/MezmurLanguageTabs';

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

  const { data: relatedMezmurs } = await supabase
    .from('mezmurs')
    .select('*')
    .eq('status', 'approved')
    .eq('title', mezmur.title)
    .order('updated_at', { ascending: false });

  const mezmursByLanguage: Partial<Record<Language, Mezmur>> = {};

  ((relatedMezmurs as Mezmur[]) || []).forEach((item) => {
    if (LANGUAGES.includes(item.language) && !mezmursByLanguage[item.language]) {
      mezmursByLanguage[item.language] = item;
    }
  });
  if (!mezmursByLanguage[mezmur.language]) {
    mezmursByLanguage[mezmur.language] = mezmur;
  }

  return (
    <main className="container">
      <Link href="/" className="nav__link" style={{ paddingLeft: 0 }}>
        ← Back to library
      </Link>

      <h1 className="page-title" style={{ marginTop: 12 }}>
        {mezmur.title}
      </h1>
      <section style={{ marginTop: 24 }}>
        <MezmurLanguageTabs mezmursByLanguage={mezmursByLanguage} defaultLanguage={mezmur.language} />
      </section>
    </main>
  );
}
