/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type SyncReleaseHashModule = {
  syncReleaseHashDocs: (rootDir?: string) => string[];
};

async function loadHashSync(): Promise<SyncReleaseHashModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/sync-release-hash.mjs');
}

function createLaunchDocsTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'anycap-release-hash-'));
  const oldHash = '0'.repeat(64);
  const zipBytes = Buffer.from('fresh release zip bytes');
  const newHash = crypto.createHash('sha256').update(zipBytes).digest('hex');

  fs.mkdirSync(path.join(root, 'releases'), { recursive: true });
  fs.mkdirSync(path.join(root, 'store-assets'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'releases/anycap-extension-0.2.0-chrome.zip'), zipBytes);
  fs.writeFileSync(
    path.join(root, 'store-assets/cws-submission.md'),
    [
      '## Package',
      '- Upload: `releases/anycap-extension-0.2.0-chrome.zip`',
      `- SHA-256: \`${oldHash}\``,
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(root, 'docs/COMPLETION-AUDIT.md'),
    [
      `| Current CWS zip hash checked | latest build-run-specific hash is \`${oldHash}\`; record again immediately before CWS upload | Done |`,
      `- SHA-256: \`.output\` and \`releases\` zip hashes matched after rebuild at \`${oldHash}\`; record the build-run-specific value again immediately before CWS upload.`,
    ].join('\n'),
  );

  return { root, oldHash, newHash };
}

describe('release hash sync', () => {
  it('syncs the current release zip SHA-256 into CWS submission and completion audit docs', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    let root = '';
    let oldHash = '';
    let newHash = '';
    try {
      const { syncReleaseHashDocs } = await loadHashSync();
      ({ root, oldHash, newHash } = createLaunchDocsTree());

      expect(syncReleaseHashDocs(root)).toEqual([]);
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }

    const submission = fs.readFileSync(path.join(root, 'store-assets/cws-submission.md'), 'utf8');
    const audit = fs.readFileSync(path.join(root, 'docs/COMPLETION-AUDIT.md'), 'utf8');
    expect(submission).toContain(`- SHA-256: \`${newHash}\``);
    expect(submission).not.toContain(oldHash);
    expect(audit).toContain(newHash);
    expect(audit).not.toContain(oldHash);
  });
});
