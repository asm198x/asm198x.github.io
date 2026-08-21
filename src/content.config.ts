/**
 * The documentation pages, loaded from the assembler's own repository.
 *
 * The source never moves here. `decisions/one-documentation-surface.md` is
 * explicit about it: a page and its generator have to fail the same build, and
 * across a repo boundary they do not. So the pages stay beside the code they
 * describe, where `cargo xtask docs --check`, `book_samples.rs` and the Vale
 * gate already run on them, and this reaches across to render them.
 *
 * `_asm198x` is the checkout the workflow makes at the released tag — the same
 * one the parity figures come from. No frontmatter schema: these are plain
 * markdown files with a leading `#`, and inventing required frontmatter would
 * be this repo dictating terms to the one that owns the content.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { readFileSync } from 'node:fs';

const docs = defineCollection({
  loader: glob({
    base: './_asm198x/docs/book/src',
    // SUMMARY.md is the nav's source, not a page. The nav itself is read from
    // the generated `nav.json`; see `src/lib/docs.ts`.
    pattern: ['**/*.md', '!SUMMARY.md'],
  }),
});

/**
 * The release history, from the assembler's changelog.
 *
 * release-plz writes `crates/asm198x/CHANGELOG.md` in Keep a Changelog form,
 * and it lives inside the package, so every release carries an up-to-date copy.
 * That file is the only source: the page states what changed and nothing here
 * restates it.
 *
 * This is a custom loader rather than a glob because the page wants one entry
 * per release — to mark which one the site documents, and to link each to the
 * comparison the changelog already names. Splitting a rendered blob afterwards
 * would mean parsing HTML instead.
 *
 * Nothing in the assembler parses this file, so unlike the navigation there is
 * no second parser here to drift from a first one.
 */
const CHANGELOG = '_asm198x/crates/asm198x/CHANGELOG.md';

const releases = defineCollection({
  loader: {
    name: 'changelog',
    load: async ({ store, renderMarkdown, logger }) => {
      store.clear();

      let text: string;
      try {
        text = readFileSync(CHANGELOG, 'utf8');
      } catch {
        logger.warn(
          `no changelog at ${CHANGELOG} — the releases page will say so`,
        );
        return;
      }

      // `## [0.0.18](compare-url) - 2026-08-21`, or `## [Unreleased]`.
      const heading = /^## \[([^\]]+)\](?:\(([^)]+)\))?(?:\s+-\s+(\S+))?\s*$/;
      const lines = text.split('\n');
      let current: { version: string; url?: string; date?: string } | null =
        null;
      let body: string[] = [];

      const flush = async () => {
        if (!current) return;
        const markdown = body.join('\n').trim();
        // An empty `## [Unreleased]` is release-plz's placeholder, not a
        // release. Nothing shipped, so nothing to show.
        if (!markdown) return;
        store.set({
          id: current.version,
          data: {
            version: current.version,
            url: current.url ?? null,
            date: current.date ?? null,
          },
          body: markdown,
          rendered: await renderMarkdown(markdown),
        });
      };

      for (const line of lines) {
        const match = heading.exec(line);
        if (match) {
          await flush();
          current = { version: match[1], url: match[2], date: match[3] };
          body = [];
        } else if (current) {
          body.push(line);
        }
      }
      await flush();
    },
  },
});

export const collections = { docs, releases };
