'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/reports', label: 'Reports' },
];

export function Nav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              Acclownting
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {profile?.role === 'admin' && (
              <Link
                href="/admin/users"
                className={`text-sm font-medium ${
                  pathname.startsWith('/admin')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile?.full_name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
