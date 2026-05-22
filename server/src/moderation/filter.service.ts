import { Injectable } from '@nestjs/common';

const RATE_LIMIT_MS = 2000; // 1 message per 2s
const SPAM_WINDOW_MS = 10_000; // rolling window
const SPAM_THRESHOLD = 5; // max messages in window

const BLOCKED_WORDS: string[] = [
  'nigger', 'nigga', 'faggot', 'kike', 'chink', 'spic', 'cunt',
];

@Injectable()
export class FilterService {
  private readonly lastSent = new Map<string, number>();
  private readonly recentTimes = new Map<string, number[]>();

  validate(socketId: string, text: string): { ok: boolean; text: string } {
    if (!text || typeof text !== 'string') return { ok: false, text: '' };

    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > 120) return { ok: false, text: '' };

    const now = Date.now();

    // Rate limit
    const last = this.lastSent.get(socketId) ?? 0;
    if (now - last < RATE_LIMIT_MS) return { ok: false, text: '' };

    // Anti-spam: rolling window
    const times = (this.recentTimes.get(socketId) ?? []).filter(
      (t) => now - t < SPAM_WINDOW_MS,
    );
    if (times.length >= SPAM_THRESHOLD) return { ok: false, text: '' };

    // Word filter
    const lower = trimmed.toLowerCase();
    if (BLOCKED_WORDS.some((w) => lower.includes(w))) return { ok: false, text: '' };

    // Update tracking
    this.lastSent.set(socketId, now);
    this.recentTimes.set(socketId, [...times, now]);

    return { ok: true, text: trimmed };
  }

  cleanup(socketId: string): void {
    this.lastSent.delete(socketId);
    this.recentTimes.delete(socketId);
  }
}
