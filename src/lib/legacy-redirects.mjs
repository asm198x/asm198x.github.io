/**
 * Where the documentation used to live.
 *
 * Two layouts have been published and neither should rot into a 404:
 *
 *   - mdBook served `/docs/cli.html`, from 2026-08-19 until it was withdrawn.
 *   - The first Astro rendering served `/docs/cli/`, for part of 2026-08-21.
 *
 * Both are short-lived, but the stub in the `asm198x/docs` repository links one
 * of them, and a link that used to work is worth a redirect however few people
 * followed it.
 *
 * Derived from the generated nav rather than listed: the new layout puts every
 * page under `reference/` or `guide/`, and the old one was the same path
 * without that prefix. Twenty-one instruction pages are not worth typing twice.
 */
import { readFileSync } from 'node:fs';

const NAV = '_asm198x/docs/book/nav.json';

export function legacyRedirects() {
  let sections;
  try {
    sections = JSON.parse(readFileSync(NAV, 'utf8')).sections;
  } catch {
    return {};
  }

  const slugs = [];
  const walk = (items) => {
    for (const item of items) {
      slugs.push(item.slug);
      walk(item.children ?? []);
    }
  };
  for (const section of sections) walk(section.items);

  const redirects = {};
  for (const slug of slugs) {
    const was = slug.replace(/^(reference|guide)\//, '');
    // `/docs/` itself is still a page — the documentation contents.
    if (!was) continue;
    redirects[`/docs/${was}`] = `/${slug}`;
    redirects[`/docs/${was}.html`] = `/${slug}`;
  }
  return redirects;
}
