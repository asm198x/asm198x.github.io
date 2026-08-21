/**
 * Rewrite links between documentation pages to the URLs they are published at.
 *
 * The source is markdown that used to be built by mdBook, which rewrote
 * `[Dialects](dialects.md)` to `dialects.html` and resolved it against the
 * page. Nothing does that now, so the moment mdBook was withdrawn every
 * cross-link in the book pointed at a `.md` file the site does not serve —
 * including the twenty-one in the instruction index.
 *
 * A page's path under the book source is the URL it is published at, so the
 * rewrite is a path resolution: take the link relative to the page's own
 * directory, drop `.md`, keep any anchor.
 *
 * Only relative `.md` links are touched. An external URL is not ours to
 * rewrite, an absolute path is already a site URL, and a bare anchor is
 * resolved by the browser.
 *
 * The assembler checks the other half — `cargo xtask docs --check` fails when a
 * link names a file that is not there — so a target that exists is rewritten
 * correctly here, and a target that does not never reaches here.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve('_asm198x/docs/book/src');

/** A Sätteri mdast plugin: one visitor, called for every link node. */
export const rewriteDocLinks = {
  name: 'rewrite-doc-links',
  link(node, ctx) {
    const url = node.url;
    if (typeof url !== 'string' || !url) return;
    if (url.includes('://') || url.startsWith('/') || url.startsWith('#')) {
      return;
    }

    const [target, anchor] = splitAnchor(url);
    if (!target.endsWith('.md')) return;

    // Which page is being rendered decides what a relative link means.
    if (!ctx.fileURL) return;
    const from = path.dirname(fileURLToPath(ctx.fileURL));
    if (!from.startsWith(SRC)) return;

    const slug = path
      .relative(SRC, path.resolve(from, target))
      .split(path.sep)
      .join('/')
      .replace(/\.md$/, '');

    // A link that climbs out of the book is not ours to rewrite.
    if (slug.startsWith('..')) return;

    ctx.setProperty(node, 'url', `/${slug}/${anchor}`);
  },
};

function splitAnchor(url) {
  const hash = url.indexOf('#');
  return hash === -1 ? [url, ''] : [url.slice(0, hash), url.slice(hash)];
}
