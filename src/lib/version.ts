/**
 * The version this site documents.
 *
 * The Pages workflow selects the newest release tag that carries the book and
 * passes it as ASM198X_REF. That is deliberately *not* always the newest
 * release: a release without `docs/book/book.toml` is skipped, and when no tag
 * qualifies the workflow falls back to building from main.
 *
 * So the label has to be honest. It says which version the pages describe, and
 * says plainly when it is describing unreleased work — a `::notice::` nobody
 * reads becomes something visible on the page.
 */

/** e.g. `asm198x-v0.0.15` -> `v0.0.15`. */
export function documentedVersion(ref = process.env.ASM198X_REF): string | null {
  if (!ref) return null;
  const tag = ref.match(/^asm198x-(v\d+\.\d+\.\d+.*)$/);
  if (tag) return tag[1];
  // A bare commit: the fallback path, when no release carries the book yet.
  return `main @ ${ref.slice(0, 7)}`;
}
