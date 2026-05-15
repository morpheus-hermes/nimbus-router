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
  // Cap total attempts at 3x the chain length so a fully-down fleet surfaces
  // an error instead of spinning forever.
  const maxAttempts = Math.max(1, chain.length * 3);
  let attempts = 0;
  let providerIndex = 0;
  let lastError: unknown;
  while (attempts < maxAttempts) {
    const provider = chain[providerIndex % chain.length];
    attempts++;
    try {
      const response = await provider.call(prompt, opts);
      return { response, providerId: provider.id, attempts };
    } catch (err) {
      lastError = err;
      providerIndex++;
      await delayBetweenAttempts(attempts);
    }
  }
  throw new Error(`fallback chain exhausted after ${attempts} attempts: ${String(lastError)}`);
}

async function delayBetweenAttempts(n: number): Promise<void> {
  const baseMs = 50 * n;
  const jitter = Math.floor(Math.random() * 25);
  await new Promise((r) => setTimeout(r, baseMs + jitter));
}
