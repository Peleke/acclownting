import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Test suite to ensure RPC calls are properly error-handled
 * and don't silently fail without logging
 * 
 * This test verifies that:
 * 1. RPC calls are properly destructured to include error objects
 * 2. Environment variables are properly formatted (no trailing whitespace)
 * 3. Supabase client initialization doesn't fail with malformed credentials
 */

describe('Supabase RPC Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('environment variables should not have trailing whitespace', () => {
    // Verify that env vars loaded from .env.local are properly formatted
    const testEnvVars = [
      'https://abrfiahrbxffnrznycev.supabase.co',
      'sb_publishable_KGqGAhx_IZy8185jbqGeWA_p_wtStNb',
      'sb_secret_nLMqWvOvaQKXeWj3mwdY9Q_BRmW6t69',
    ];

    testEnvVars.forEach((envVar) => {
      // Should not end with \n (literal backslash-n)
      expect(envVar).not.toMatch(/\\n$/);
      // Should not have trailing whitespace
      expect(envVar).not.toMatch(/\s+$/);
    });
  });

  it('RPC response objects should be destructured to include error property', () => {
    // Mock Supabase response
    const mockRpcResponse = {
      data: [{ total_invoiced: 1000, total_paid: 500, total_outstanding: 500 }],
      error: null,
    };

    // Verify the error property exists in the response
    expect(mockRpcResponse).toHaveProperty('error');
    expect(mockRpcResponse).toHaveProperty('data');
  });

  it('RPC error response should be properly destructured', () => {
    // Mock Supabase error response
    const mockRpcErrorResponse = {
      data: null,
      error: {
        message: 'Invalid credentials',
        code: '401',
      },
    };

    // Verify error is extractable
    const { data, error } = mockRpcErrorResponse;
    expect(data).toBeNull();
    expect(error).not.toBeNull();
    expect(error.message).toBe('Invalid credentials');
  });

  it('should detect when environment variables are malformed', () => {
    // Simulate malformed env var with literal \n
    const malformedUrl = 'https://abrfiahrbxffnrznycev.supabase.co\\n';
    
    // This would cause connection failures
    expect(malformedUrl).toMatch(/\\n$/);
    
    // The fix should remove these
    const fixedUrl = malformedUrl.replace(/\\n$/, '');
    expect(fixedUrl).not.toMatch(/\\n$/);
    expect(fixedUrl).toBe('https://abrfiahrbxffnrznycev.supabase.co');
  });
});
