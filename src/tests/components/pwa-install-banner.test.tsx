import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PWAInstallBanner } from '@/components/pwa-install-banner';

// Store originals
const originalNavigator = window.navigator;
const originalMatchMedia = window.matchMedia;

let store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { store = {}; }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });

function mockUserAgent(ua: string) {
  Object.defineProperty(window, 'navigator', {
    value: { ...originalNavigator, userAgent: ua },
    writable: true,
    configurable: true,
  });
}

function mockMatchMedia(standaloneMatch: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('standalone') ? standaloneMatch : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  store = {};
  vi.clearAllMocks();
  mockMatchMedia(false);
});

afterEach(() => {
  Object.defineProperty(window, 'navigator', {
    value: originalNavigator,
    writable: true,
    configurable: true,
  });
  window.matchMedia = originalMatchMedia;
});

describe('PWAInstallBanner', () => {
  it('shows iOS install instructions on Safari', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    render(<PWAInstallBanner />);
    expect(screen.getByText('Install Acclownting')).toBeInTheDocument();
    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
  });

  it('does not show banner when already in standalone mode', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');
    mockMatchMedia(true);
    render(<PWAInstallBanner />);
    expect(screen.queryByText('Install Acclownting')).not.toBeInTheDocument();
  });

  it('does not show banner when previously dismissed', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    localStorage.setItem('acclownting-pwa-install-dismissed-v1', '1');
    render(<PWAInstallBanner />);
    expect(screen.queryByText('Install Acclownting')).not.toBeInTheDocument();
  });

  it('dismisses and persists to localStorage', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    render(<PWAInstallBanner />);
    fireEvent.click(screen.getByLabelText('Dismiss install banner'));
    expect(screen.queryByText('Install Acclownting')).not.toBeInTheDocument();
    expect(localStorage.getItem('acclownting-pwa-install-dismissed-v1')).toBe('1');
  });

  it('does not show banner on non-iOS desktop browsers without beforeinstallprompt', () => {
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    render(<PWAInstallBanner />);
    expect(screen.queryByText('Install Acclownting')).not.toBeInTheDocument();
  });

  it('shows install button when beforeinstallprompt fires', async () => {
    mockUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0');
    render(<PWAInstallBanner />);
    const event = new Event('beforeinstallprompt');
    Object.assign(event, { prompt: vi.fn(), preventDefault: vi.fn() });
    window.dispatchEvent(event);
    await waitFor(() => {
      expect(screen.getByText('Install')).toBeInTheDocument();
    });
  });
});
