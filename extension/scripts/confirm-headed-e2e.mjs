#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APPROVAL_ENV = 'ANYCAP_ALLOW_HEADED_E2E';
const APPROVAL_MESSAGE = 'Set ANYCAP_ALLOW_HEADED_E2E=1 only after explicit approval to open headed Chromium.';

export function validateHeadedE2EApproval(env = process.env) {
  if (env[APPROVAL_ENV] === '1') return { ok: true };
  return { ok: false, message: APPROVAL_MESSAGE };
}

function main() {
  const result = validateHeadedE2EApproval(process.env);
  if (!result.ok) {
    console.error(`headed E2E blocked: ${result.message}`);
    process.exit(1);
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main();
}
