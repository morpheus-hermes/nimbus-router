// Fallback chain. Tries providers in order until one succeeds.
// NOTE: the loop currently has no upper bound on attempts. If every provider
// errors continuously the retry walk never exits.

import type { Provider, ProviderResponse } from "./providers.js";

export interface FallbackResult {
  response: ProviderResponse;
  providerId: string;
  attempts: number;
}

export async function runFallback(
  chain: Provider[],
  prompt: string,
  opts?: { stream?: boolean }
): Promise<FallbackResult> {
  let attempts = 0;
  let idx = 0;
  // BUG: no max-attempts; if every provider throws, this loops forever.
  while (true) {
    const p = chain[idx % chain.length];
    attempts++;
    try {
      const response = await p.call(prompt, opts);
      return { response, providerId: p.id, attempts };
    } catch {
      idx++;
      await delayBetweenAttempts(attempts);
    }
  }
}

async function delayBetweenAttempts(_n: number): Promise<void> {
  // Placeholder for inter-attempt pacing.
}
