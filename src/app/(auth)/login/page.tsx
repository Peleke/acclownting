'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const result = loginSchema.safeParse(raw);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword(result.data);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Acclownting</h1>
          <p className="text-sm text-stone-400 mt-1">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}
            <Input id="email" name="email" label="Email" type="email" required />
            <Input id="password" name="password" label="Password" type="password" required />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
