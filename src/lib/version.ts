import { readFileSync } from 'node:fs';

/**
 * The version this site documents.
 *
 * scripts/fetch-asm198x.sh selects the newest release tag that carries the book
 * and records it in _asm198x/.documented-version (ASM198X_REF overrides it).
 * That is deliberately *not* always the newest
 * release: a release without `docs/book/src/SUMMARY.md` is skipped, and when no tag
 * qualifies the workflow falls back to building from main.
 *
 * So the label has to be honest. It says which version the pages describe, and
 * says plainly when it is describing unreleased work — a `::notice::` nobody
 * reads becomes something visible on the page.
 */

/** e.g. `asm198x-v0.0.15` -> `v0.0.15`. */
function recordedRef(): string | undefined {
  try {
    return readFileSync('_asm198x/.documented-version', 'utf8').trim() || undefined;
  } catch {
    return undefined;
  }
}

export function documentedVersion(ref = process.env.ASM198X_REF ?? recordedRef()): string | null {
  if (!ref) return null;
  const tag = ref.match(/^asm198x-(v\d+\.\d+\.\d+.*)$/);
  if (tag) return tag[1];
  // A bare commit: the fallback path, when no release carries the book yet.
  return `main @ ${ref.slice(0, 7)}`;
}
