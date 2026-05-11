# nimbus-router

A tiny cost-aware LLM router. Given a prompt and a tier
(`cheap` | `balanced` | `premium`), picks a provider, returns a stubbed
response with token usage and cost. Falls back through a chain of
providers when one errors.

## Run

    npm install
    npx tsx src/index.ts

## Test

    node --test --import tsx test/
