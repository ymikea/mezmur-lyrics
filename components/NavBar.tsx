'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface NavBarProps {
  isStaff: boolean;
}

export default function NavBar({ isStaff }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (href: string) =>
    `nav__link${pathname === href ? ' nav__link--active' : ''}`;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="nav">
      <Link href="/" className="nav__brand">
        Mezmur Lyrics
      </Link>
      <div className="nav__links">
        <Link href="/" className={linkClass('/')}>
          Home
        </Link>
        <Link href="/submit" className={linkClass('/submit')}>
          Submit
        </Link>
        {isStaff ? (
          <>
            <Link href="/admin" className={linkClass('/admin')}>
              Admin
            </Link>
            <button type="button" className="btn" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className={linkClass('/login')}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
