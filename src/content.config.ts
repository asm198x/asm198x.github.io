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

const docs = defineCollection({
  loader: glob({
    base: './_asm198x/docs/book/src',
    // SUMMARY.md is the nav's source, not a page. The nav itself is read from
    // the generated `nav.json`; see `src/lib/docs.ts`.
    pattern: ['**/*.md', '!SUMMARY.md'],
  }),
});

export const collections = { docs };
