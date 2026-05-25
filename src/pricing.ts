// Cost-per-1k-tokens for each provider. Stubbed numbers.
export interface Price { input: number; output: number; }

export const DEFAULT_TIERS = ["cheap", "balanced", "premium"] as const;

export const pricing: Record<string, Price> = {
  cheap: { input: 0.0001, output: 0.0002 },
  balanced: { input: 0.001, output: 0.002 },
  premium: { input: 0.01, output: 0.04 },
};

export function cost(tier: string, inTok: number, outTok: number): number {
  const p = pricing[tier];
  if (!p) return 0;
  return (inTok * p.input + outTok * p.output) / 1000;
}

export function isKnownTier(t: string): boolean {
  return Object.prototype.hasOwnProperty.call(pricing, t);
}

export function listTiers(): string[] {
  return Object.keys(pricing);
}
