import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Nav } from './nav';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // E2E test bypass - render with mock profile
  if (process.env.BYPASS_AUTH === 'true') {
    const mockProfile = { id: 'e2e-user', full_name: 'E2E Test User', role: 'admin' as const, created_at: '' };
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav profile={mockProfile} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
