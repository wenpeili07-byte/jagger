import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readme = readFileSync(new URL("./README.md", import.meta.url), "utf8");

test("contact setup documents the Resend onboarding sender restriction", () => {
  assert.match(readme, /onboarding@resend\.dev[\s\S]*only send(?:s)? to the email address associated with that Resend account/i);
  assert.match(readme, /lonmadynamic@gmail\.com[\s\S]*(?:must be used to create|must own|must be associated with) the Resend account/i);
  assert.match(readme, /verified domain sender/i);
  assert.match(readme, /403[\s\S]*502/);
});
