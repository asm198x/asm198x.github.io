#!/usr/bin/env bash
# Fetch the assembler into _asm198x, at the version the site documents.
#
# The same rule locally and in CI, so `npm run build` is all either needs:
# the newest release tag that carries the book (docs/book/src/SUMMARY.md); and
# when the code hasn't changed since that tag, main, so a documentation-only
# change reaches readers without waiting for a release. With no release
# carrying the book yet, main. The chosen ref is written to
# _asm198x/.documented-version, which src/lib/version.ts shows on the page;
# ASM198X_REF overrides the choice.
#
# _asm198x is gitignored; no documentation source is vendored into this repo.
set -euo pipefail

REPO="https://github.com/asm198x/asm198x.git"
DIR="_asm198x"

if [ -L "$DIR" ]; then
  echo "asm198x: $DIR is a symlink — leaving it alone" >&2
  exit 0
fi

if [ ! -d "$DIR/.git" ]; then
  rm -rf "$DIR"
  # Full history without blobs: tags are needed to choose the version.
  git clone --quiet --filter=blob:none "$REPO" "$DIR"
fi
git -C "$DIR" fetch --quiet --tags origin

ref="${ASM198X_REF:-}"
version="$ref"
if [ -z "$ref" ]; then
  for tag in $(git -C "$DIR" tag --list 'asm198x-v*' --sort=-v:refname); do
    if git -C "$DIR" cat-file -e "${tag}:docs/book/src/SUMMARY.md" 2>/dev/null; then
      ref="$tag"
      break
    fi
  done
  if [ -z "$ref" ]; then
    echo "asm198x: no release carries the book yet; documenting main" >&2
    ref=$(git -C "$DIR" rev-parse origin/main)
    version="$ref"
  else
    version="$ref"
    if git -C "$DIR" diff --quiet "$ref" origin/main -- crates xtask Cargo.toml Cargo.lock; then
      echo "asm198x: code unchanged since $ref; publishing documentation from main"
      ref=$(git -C "$DIR" rev-parse origin/main)
    else
      echo "asm198x: code has moved since $ref; publishing its documentation until the next release"
    fi
  fi
fi

git -C "$DIR" checkout --quiet --detach "$ref"
printf '%s\n' "$version" > "$DIR/.documented-version"
echo "asm198x: documenting $version (checked out $(git -C "$DIR" rev-parse --short HEAD))"
