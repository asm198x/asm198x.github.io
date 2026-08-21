#!/usr/bin/env bash
# Fetch the assembler into _asm198x, at the release the site documents.
#
# CI checks it out with actions/checkout and selects the tag in the workflow;
# this is the same thing for local work, so `npm run dev` renders the real
# documentation instead of nothing. Both write to _asm198x, which is
# gitignored — no documentation source is ever vendored into this repo.
#
# The selection rule matches the workflow: the newest release that actually
# carries the documentation. A release predating it has no SUMMARY.md, and
# checking one out would build a site with no docs at all.
set -euo pipefail

REPO="https://github.com/asm198x/asm198x.git"
DIR="_asm198x"

# CI has already placed and positioned the checkout; do not fight it.
if [ -n "${CI:-}" ]; then
  echo "asm198x: CI provides the checkout"
  exit 0
fi

# A symlink here is almost always someone pointing at their own working
# checkout to test a change. The checkout below would detach their HEAD and
# throw away what they were doing, so refuse instead.
if [ -L "$DIR" ]; then
  echo "asm198x: $DIR is a symlink — leaving it alone" >&2
  exit 0
fi

if [ ! -d "$DIR/.git" ]; then
  rm -rf "$DIR"
  git clone --quiet --filter=blob:none "$REPO" "$DIR"
fi

git -C "$DIR" fetch --quiet --tags origin

ref="${ASM198X_REF:-}"
if [ -z "$ref" ]; then
  for tag in $(git -C "$DIR" tag --list 'asm198x-v*' --sort=-v:refname); do
    if git -C "$DIR" cat-file -e "${tag}:docs/book/src/SUMMARY.md" 2>/dev/null; then
      ref="$tag"
      break
    fi
  done
fi

if [ -z "$ref" ]; then
  echo "asm198x: no release carries the documentation yet; using main" >&2
  ref="origin/main"
fi

git -C "$DIR" checkout --quiet --detach "$ref"
echo "asm198x: at $ref"
