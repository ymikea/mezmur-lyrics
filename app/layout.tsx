import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'Mezmur Lyrics',
  description: 'Eritrean Orthodox Tewahedo hymn lyrics management app',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isStaff = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      isStaff = !!roleRow && ['admin', 'moderator'].includes(roleRow.role);
    }
  }

  return (
    <html lang="en">
      <body>
        <NavBar isStaff={isStaff} />
        {children}
      </body>
    </html>
  );
}
