import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Verify the Wine & Gold palette CSS variables are defined in globals.css
 * and the status colors in tailwind.config.ts are consistent.
 */

const globalsCSS = readFileSync(resolve(__dirname, '../../app/globals.css'), 'utf-8');
const tailwindConfig = readFileSync(resolve(__dirname, '../../../tailwind.config.ts'), 'utf-8');

describe('Wine & Gold Palette', () => {
  describe('globals.css CSS variables', () => {
    it('defines primary as Rich Cerulean (hsl 202)', () => {
      expect(globalsCSS).toContain('--primary: 202 66% 39%');
    });

    it('defines secondary as Royal Gold (hsl 49)', () => {
      expect(globalsCSS).toContain('--secondary: 49 94% 68%');
    });

    it('defines accent as Sunflower Gold (hsl 42)', () => {
      expect(globalsCSS).toContain('--accent: 42 79% 54%');
    });

    it('defines destructive as Wine Plum (hsl 355)', () => {
      expect(globalsCSS).toContain('--destructive: 355 39% 28%');
    });

    it('defines warm neutral background', () => {
      expect(globalsCSS).toContain('--background: 30 20% 97%');
    });

    it('defines ring matching primary', () => {
      expect(globalsCSS).toContain('--ring: 202 66% 39%');
    });
  });

  describe('tailwind.config.ts status colors', () => {
    it('defines draft status with warm neutral tones', () => {
      expect(tailwindConfig).toContain("draft: { bg: '#F5F0EB'");
    });

    it('defines sent status with cerulean tones', () => {
      expect(tailwindConfig).toContain("sent: { bg: '#D9EBF5'");
      expect(tailwindConfig).toContain("dot: '#2274A5'");
    });

    it('defines partial status with gold tones', () => {
      expect(tailwindConfig).toContain("dot: '#E6AF2E'");
    });

    it('defines overdue status with wine plum tones', () => {
      expect(tailwindConfig).toContain("overdue: { bg: '#F5D6D8'");
      expect(tailwindConfig).toContain("text: '#632B30'");
    });

    it('keeps paid status green (unchanged)', () => {
      expect(tailwindConfig).toContain("paid: { bg: '#DCFCE7'");
    });
  });
});
