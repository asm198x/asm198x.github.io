/**
 * What the released assembler has actually been held to.
 *
 * The front door makes a claim per machine — this curriculum assembles
 * byte-for-byte to what the reference tool produces — and for a while the
 * numbers in it were wrong. They were typed by hand from a test suite that
 * later quadrupled what it checks, and nothing was watching them.
 *
 * So they are not typed here either. `cargo xtask parity --write` derives them
 * from the verdict corpus and commits the result; the Pages workflow checks the
 * assembler out at the release it documents, and this reads that file. The page
 * therefore states what *that release* proved, not what main proves today.
 *
 * A missing file is an ordinary state, not an error: local `npm run dev` has no
 * checkout, and no release before v0.0.17 carries the data. The page drops the
 * number in that case rather than showing a remembered one — a figure with
 * nothing behind it is the problem this file exists to fix.
 */
import { readFileSync } from 'node:fs';

/** One reference tool's contribution to a machine's parity. */
export interface Arbiter {
  tool: string;
  /** The tool's own version banner — what the corpus keys on. */
  identity: string;
  variants: string[];
  comparisons: number;
}

export interface MachineParity {
  slug: string;
  cpu: string;
  /** Distinct curriculum files with a recorded verdict. */
  sources: number;
  /** Verdicts over them: two tools, or two output formats, count twice. */
  comparisons: number;
  arbiters: Arbiter[];
}

export interface Parity {
  /** The Code198x revision the verdicts describe. */
  pin: string | null;
  machines: MachineParity[];
  totals: { sources: number; comparisons: number };
}

const DATA = '_asm198x/crates/asm198x/tests/verdicts/parity.json';

let cached: Parity | null | undefined;

/** The committed figures, or null when this build cannot see them. */
export function parity(path = DATA): Parity | null {
  if (cached !== undefined) return cached;
  try {
    cached = JSON.parse(readFileSync(path, 'utf8')) as Parity;
  } catch {
    console.warn(
      `parity: no figures at ${path} — the front door will omit the counts`,
    );
    cached = null;
  }
  return cached;
}

/** One machine's figures, or null when unavailable. */
export function machine(slug: string): MachineParity | null {
  return parity()?.machines.find((m) => m.slug === slug) ?? null;
}
