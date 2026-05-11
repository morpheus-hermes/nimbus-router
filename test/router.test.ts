import { test } from "node:test";
import assert from "node:assert/strict";
import { route } from "../src/index.js";

test("routes balanced tier to nimbus-base", async () => {
  const r = await route({ prompt: "ping", tier: "balanced" });
  assert.equal(r.providerId, "nimbus-base");
  assert.ok(r.costUsd >= 0);
});

test("rejects unknown tier", async () => {
  await assert.rejects(() => route({ prompt: "ping", tier: "exotic" as any }));
});
