import { providers } from "./providers.js";
import { runFallback } from "./fallback.js";
import { cost } from "./pricing.js";

export interface RouteRequest {
  prompt: string;
  tier: "cheap" | "balanced" | "premium";
  stream?: boolean;
}

export interface RouteResult {
  text: string;
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export async function route(req: RouteRequest): Promise<RouteResult> {
  const chain = providers.filter((p) => p.tier === req.tier);
  if (chain.length === 0) throw new Error(`no providers for tier: ${req.tier}`);
  const { response, providerId } = await runFallback(chain, req.prompt, { stream: req.stream });
  return {
    text: response.text,
    providerId,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: cost(req.tier, response.inputTokens, response.outputTokens),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  route({ prompt: "hello", tier: "balanced" }).then((r) => console.log(JSON.stringify(r, null, 2)));
}
