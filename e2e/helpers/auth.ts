import { type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Test user credentials from environment variables.
 * Set these in .env.test or CI environment:
 *   E2E_USER_EMAIL, E2E_USER_PASSWORD
 */
export const TEST_USER = {
  email: process.env.E2E_USER_EMAIL || 'test@acclownting.local',
  password: process.env.E2E_USER_PASSWORD || 'testpassword123',
};

/**
 * Log in via the UI login form. Use this when testing the actual login flow.
 */
export async function loginViaUI(page: Page, email?: string, password?: string) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email || TEST_USER.email);
  await page.locator('input[name="password"]').fill(password || TEST_USER.password);
  await page.locator('button[type="submit"]').click();
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

/**
 * Set up auth state by signing in via Supabase directly and injecting the
 * session into the browser. Much faster than going through the UI each time.
 *
 * This sets cookies so subsequent page navigations are authenticated.
 */
export async function loginViaSupabase(page: Page, email?: string, password?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set for auth helper'
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email || TEST_USER.email,
    password: password || TEST_USER.password,
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in via Supabase: ${error?.message || 'No session returned'}`);
  }

  const { access_token, refresh_token } = data.session;

  // Navigate to the app first so we can set cookies on the correct domain
  await page.goto('/login');

  // Supabase SSR stores tokens in cookies. The cookie names follow the pattern:
  // sb-<project-ref>-auth-token
  // We set both the access and refresh tokens.
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const cookieBase = `sb-${projectRef}-auth-token`;

  // Supabase SSR uses chunked cookies. Set the main cookie with the full session JSON.
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    token_type: 'bearer',
    expires_in: data.session.expires_in,
    expires_at: data.session.expires_at,
    user: data.session.user,
  });

  // For @supabase/ssr, cookies are chunked at 3180 chars. We'll set them properly.
  const chunks = chunkString(sessionPayload, 3180);
  const baseUrl = new URL(page.url());

  for (let i = 0; i < chunks.length; i++) {
    const name = chunks.length === 1 ? cookieBase : `${cookieBase}.${i}`;
    await page.context().addCookies([
      {
        name,
        value: chunks[i],
        domain: baseUrl.hostname,
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  }

  // Navigate to dashboard to verify auth worked
  await page.goto('/dashboard');
}

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.substring(i, i + size));
  }
  return chunks.length === 0 ? [''] : chunks;
}

/**
 * Sign out via the UI. Clicks the "Sign Out" button in the nav.
 */
export async function signOut(page: Page) {
  await page.getByText('Sign Out').click();
  await page.waitForURL('**/login', { timeout: 10000 });
}
