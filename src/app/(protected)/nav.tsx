'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';

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
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const allLinks = profile?.role === 'admin'
    ? [...links, { href: '/admin/users', label: 'Admin' }]
    : links;

  return (
    <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="text-[15px] font-bold text-foreground tracking-tight mr-6">
              Acclownting
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {allLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground font-medium">{profile?.full_name}</span>
            <div className="w-px h-4 bg-border" />
            <ThemeToggle />
            <div className="w-px h-4 bg-border" />
            <button
              onClick={handleSignOut}
              className="text-[13px] text-muted-foreground/70 hover:text-foreground font-medium"
            >
              Sign Out
            </button>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <path d="M5 5l10 10" />
                  <path d="M15 5L5 15" />
                </>
              ) : (
                <>
                  <path d="M3 5h14" />
                  <path d="M3 10h14" />
                  <path d="M3 15h14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {allLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-border/50 px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground font-medium">{profile?.full_name}</span>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="text-[13px] text-muted-foreground/70 hover:text-foreground font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
