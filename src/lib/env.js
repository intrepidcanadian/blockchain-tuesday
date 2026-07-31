// Load .env without a dependency and without `node --env-file`.
//
// `--env-file` is a Node 20.6+ flag, and on a missing file it fails with
// `node: .env: not found` before your code runs at all — so a friendly error
// message never gets the chance to fire. At a workshop that reads as "the repo
// is broken." Doing it in-process keeps the Node 18 promise and lets a missing
// key explain itself.

import { readFileSync } from 'node:fs';

export function loadEnv(path = '.env') {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return false; // no .env is fine — callers explain what is missing
  }

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // strip matching surrounding quotes
    if (value.length > 1 && value[0] === value.at(-1) && (value[0] === '"' || value[0] === "'")) {
      value = value.slice(1, -1);
    }

    // real environment variables win over the file
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}
