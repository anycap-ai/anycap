#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RELEASE_ZIP = 'releases/anycap-extension-0.2.0-chrome.zip';
const CWS_SUBMISSION = 'store-assets/cws-submission.md';
const COMPLETION_AUDIT = 'docs/COMPLETION-AUDIT.md';
const SHA256_RE = /\b[a-f0-9]{64}\b/g;

function readCurrentHash(rootDir) {
  const releaseZipPath = path.join(rootDir, RELEASE_ZIP);
  if (!fs.existsSync(releaseZipPath)) {
    throw new Error(`${RELEASE_ZIP} is missing`);
  }
  return crypto.createHash('sha256').update(fs.readFileSync(releaseZipPath)).digest('hex');
}

function syncSubmissionDoc(rootDir, hash) {
  const docPath = path.join(rootDir, CWS_SUBMISSION);
  if (!fs.existsSync(docPath)) {
    throw new Error(`${CWS_SUBMISSION} is missing`);
  }

  const source = fs.readFileSync(docPath, 'utf8');
  const next = source.replace(/- SHA-256: `([a-f0-9]{64})`/, `- SHA-256: \`${hash}\``);
  if (next === source && !source.includes(hash)) {
    throw new Error(`${CWS_SUBMISSION} must contain a "- SHA-256: \`...\`" line`);
  }
  if (next !== source) {
    fs.writeFileSync(docPath, next);
  }
}

function syncAuditDoc(rootDir, hash) {
  const docPath = path.join(rootDir, COMPLETION_AUDIT);
  if (!fs.existsSync(docPath)) {
    throw new Error(`${COMPLETION_AUDIT} is missing`);
  }

  const source = fs.readFileSync(docPath, 'utf8');
  const next = source.replace(SHA256_RE, hash);
  if (next === source && !source.includes(hash)) {
    throw new Error(`${COMPLETION_AUDIT} must contain the current release zip SHA-256`);
  }
  if (next !== source) {
    fs.writeFileSync(docPath, next);
  }
}

export function syncReleaseHashDocs(rootDir = process.cwd()) {
  const errors = [];
  let hash = '';

  try {
    hash = readCurrentHash(rootDir);
    syncSubmissionDoc(rootDir, hash);
    syncAuditDoc(rootDir, hash);
  } catch (err) {
    errors.push(err.message);
  }

  return errors;
}

function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const errors = syncReleaseHashDocs();
  if (errors.length > 0) {
    for (const error of errors) console.error(`sync release hash: ${error}`);
    process.exit(1);
  }
  console.log('sync release hash: ok');
}
