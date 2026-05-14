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
  // Walk the chain round-robin, retrying on errors with paced backoff.
  let attempts = 0;
  let providerIndex = 0;
  // BUG: no max-attempts; if every provider throws, this loops forever.
  while (true) {
    const provider = chain[providerIndex % chain.length];
    attempts++;
    try {
      const response = await provider.call(prompt, opts);
      return { response, providerId: provider.id, attempts };
    } catch {
      providerIndex++;
      await delayBetweenAttempts(attempts);
    }
  }
}

async function delayBetweenAttempts(n: number): Promise<void> {
  const baseMs = 50 * n;
  const jitter = Math.floor(Math.random() * 25);
  await new Promise((r) => setTimeout(r, baseMs + jitter));
}
