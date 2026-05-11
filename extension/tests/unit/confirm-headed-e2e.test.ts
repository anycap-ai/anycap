/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

type ConfirmHeadedE2EModule = {
  validateHeadedE2EApproval: (env: Record<string, string | undefined>) => { ok: boolean; message?: string };
};

async function loadGuard(): Promise<ConfirmHeadedE2EModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/confirm-headed-e2e.mjs');
}

describe('headed E2E confirmation guard', () => {
  it('requires explicit environment acknowledgement before opening headed Chromium', async () => {
    const { validateHeadedE2EApproval } = await loadGuard();

    expect(validateHeadedE2EApproval({})).toEqual({
      ok: false,
      message: 'Set ANYCAP_ALLOW_HEADED_E2E=1 only after explicit approval to open headed Chromium.',
    });
    expect(validateHeadedE2EApproval({ ANYCAP_ALLOW_HEADED_E2E: '0' })).toEqual({
      ok: false,
      message: 'Set ANYCAP_ALLOW_HEADED_E2E=1 only after explicit approval to open headed Chromium.',
    });
    expect(validateHeadedE2EApproval({ ANYCAP_ALLOW_HEADED_E2E: '1' })).toEqual({ ok: true });
  });
});
