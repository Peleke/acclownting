import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase modules before importing the route
const mockGetUser = vi.fn();
const mockProfileSelect = vi.fn();
const mockCreateUser = vi.fn();
const mockAdminUpdate = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockProfileSelect(),
            }),
          }),
        };
      }
      return {};
    },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        createUser: (args: unknown) => mockCreateUser(args),
      },
    },
    from: () => ({
      update: () => ({
        eq: () => mockAdminUpdate(),
      }),
    }),
  }),
}));

// Import after mocks
const { POST } = await import('@/app/api/admin/invite/route');

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/invite', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/admin/invite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ email: 'a@b.com', full_name: 'X', role: 'staff' }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'staff' } });

    const res = await POST(makeRequest({ email: 'a@b.com', full_name: 'X', role: 'staff' }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('returns 400 for invalid body', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } });

    const res = await POST(makeRequest({ email: 'bad-email', full_name: '', role: 'staff' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid role', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } });

    const res = await POST(makeRequest({ email: 'a@b.com', full_name: 'X', role: 'superadmin' }));
    expect(res.status).toBe(400);
  });

  it('creates user successfully as staff', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null });

    const res = await POST(makeRequest({ email: 'new@staff.com', full_name: 'New Staff', role: 'staff' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(mockCreateUser).toHaveBeenCalledWith({
      email: 'new@staff.com',
      email_confirm: true,
      user_metadata: { full_name: 'New Staff' },
    });
  });

  it('creates user and updates role for admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-admin' } }, error: null });
    mockAdminUpdate.mockResolvedValue({ data: null, error: null });

    const res = await POST(makeRequest({ email: 'new@admin.com', full_name: 'New Admin', role: 'admin' }));
    expect(res.status).toBe(200);
    expect(mockAdminUpdate).toHaveBeenCalled();
  });

  it('returns 400 when user creation fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } });
    mockCreateUser.mockResolvedValue({ data: { user: null }, error: { message: 'Email already taken' } });

    const res = await POST(makeRequest({ email: 'existing@user.com', full_name: 'X', role: 'staff' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Email already taken');
  });

  it('validates required fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } });

    // Missing full_name
    const res = await POST(makeRequest({ email: 'a@b.com', role: 'staff' }));
    expect(res.status).toBe(400);
  });
});
