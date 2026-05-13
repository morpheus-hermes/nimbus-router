// Provider registry. Each provider has an id, a tier, and a stubbed call.
// NOTE: the streaming path currently overwrites the token count on each chunk
// instead of accumulating, so streaming responses are under-counted.

export interface ProviderResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface Provider {
  id: string;
  tier: "cheap" | "balanced" | "premium";
  call(prompt: string, opts?: { stream?: boolean }): Promise<ProviderResponse>;
}

function stubChunks(text: string): string[] {
  // Pretend the response arrives in 4 chunks.
  const n = 4;
  const step = Math.ceil(text.length / n);
  const out: string[] = [];
  for (let i = 0; i < text.length; i += step) out.push(text.slice(i, i + step));
  return out;
}

async function stubCall(id: string, prompt: string, opts?: { stream?: boolean }): Promise<ProviderResponse> {
  const text = `[${id}] reply to: ${prompt.slice(0, 40)}`;
  const inputTokens = Math.max(1, Math.ceil(prompt.length / 4));
  if (opts?.stream) {
    let streamTokenCount = 0;
    for (const chunk of stubChunks(text)) {
      // Accumulate per-chunk tokens so streaming totals match non-streaming.
      streamTokenCount += Math.ceil(chunk.length / 4);
    }
    return { text, inputTokens, outputTokens: streamTokenCount };
  }
  return { text, inputTokens, outputTokens: Math.ceil(text.length / 4) };
}

export const providers: Provider[] = [
  { id: "nimbus-mini",  tier: "cheap",    call: (p, o) => stubCall("nimbus-mini", p, o) },
  { id: "nimbus-base",  tier: "balanced", call: (p, o) => stubCall("nimbus-base", p, o) },
  { id: "nimbus-ultra", tier: "premium",  call: (p, o) => stubCall("nimbus-ultra", p, o) },
];
