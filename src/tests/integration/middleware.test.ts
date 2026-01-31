import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: () => mockGetUser() },
  }),
}));

const { updateSession } = await import('@/lib/supabase/middleware');

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe('Auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(makeRequest('/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('allows unauthenticated access to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(makeRequest('/login'));
    expect(res.status).toBe(200);
  });

  it('redirects authenticated user away from /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const res = await updateSession(makeRequest('/login'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  it('allows authenticated user to access protected routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const res = await updateSession(makeRequest('/dashboard'));
    expect(res.status).toBe(200);
  });

  it('allows unauthenticated access to /auth paths', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(makeRequest('/auth/callback'));
    expect(res.status).toBe(200);
  });
});
