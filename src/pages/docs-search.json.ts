/**
 * The search index, served for the client to fetch on first use.
 *
 * Emitted rather than inlined into every page: it is 16K gzipped and only the
 * reader who opens search needs it, so a page that is never searched pays
 * nothing for the box being there.
 */
import type { APIRoute } from 'astro';
import { searchIndex } from '@lib/search';

export const GET: APIRoute = () => {
  const entries = searchIndex() ?? [];
  return new Response(JSON.stringify({ entries }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
