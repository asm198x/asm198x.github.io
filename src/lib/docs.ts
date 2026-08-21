/**
 * The documentation navigation.
 *
 * Authored in the assembler's `SUMMARY.md` and generated from it into
 * `nav.json` by `cargo xtask docs`. This reads that file and does not parse
 * SUMMARY.md — a second parser in a second language across a repo boundary is
 * the drift that has already cost this project a wrong CLI reference and a
 * landing page claiming 80 C64 units against a corpus of 138.
 *
 * The gate lives with the source too: `cargo xtask docs --check` fails when the
 * nav lists a page that does not exist, or a page the nav does not list. That is
 * mdBook's `create-missing = false`, kept after mdBook was withdrawn.
 *
 * A missing file is an ordinary state. No release before v0.0.18 carries the
 * nav, and a local checkout may have none, so the site renders without the
 * documentation section instead of failing the build.
 */
import { readFileSync } from 'node:fs';

export interface NavItem {
  title: string;
  /** The page path without `.md`: `introduction`, `instructions/mos6502`. */
  slug: string;
  children: NavItem[];
}

export interface NavSection {
  /** The heading above this run of pages. The leading pages have none. */
  title: string | null;
  items: NavItem[];
}

const NAV = '_asm198x/docs/book/nav.json';

let cached: NavSection[] | null | undefined;

/** The generated nav, or null when this build cannot see it. */
export function nav(path = NAV): NavSection[] | null {
  if (cached !== undefined) return cached;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as {
      sections: NavSection[];
    };
    cached = parsed.sections;
  } catch {
    console.warn(
      `docs: no nav at ${path} — the documentation section will not be built`,
    );
    cached = null;
  }
  return cached;
}

/** Every page in nav order, flattened. Reading order, for prev/next. */
export function ordered(sections: NavSection[]): NavItem[] {
  const out: NavItem[] = [];
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      out.push(item);
      walk(item.children);
    }
  };
  for (const section of sections) walk(section.items);
  return out;
}

/** The section heading a slug sits under, for the page's eyebrow. */
export function sectionOf(
  sections: NavSection[],
  slug: string,
): string | null {
  const has = (items: NavItem[]): boolean =>
    items.some((i) => i.slug === slug || has(i.children));
  return sections.find((s) => has(s.items))?.title ?? null;
}
