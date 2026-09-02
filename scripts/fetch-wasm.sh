#!/usr/bin/env bash
# Build the assembler's browser module into public/playground/.
#
# The playground page loads /playground/asm198x_web.js at runtime. The module
# is built from the same _asm198x checkout the documentation is read from, so
# the assembler a visitor runs in the tab is the one the pages describe — the
# released one, by the same selection rule (see scripts/fetch-asm198x.sh).
#
# The output is gitignored and rebuilt on every run, like the fonts: nothing
# generated is vendored here. Two situations leave the page without a module,
# both reported rather than failed, so a site build never hinges on a Rust
# toolchain being present:
#   * the selected release predates crates/asm198x-web;
#   * wasm-pack (or the wasm32 target) is not installed locally.
# The page tells the visitor the playground is unavailable in either case.
set -euo pipefail

SRC="_asm198x/crates/asm198x-web"
OUT="public/playground"

rm -rf "$OUT"

if [ ! -f "$SRC/Cargo.toml" ]; then
  echo "playground: the selected asm198x release has no web crate; skipping" >&2
  exit 0
fi

if ! command -v wasm-pack >/dev/null 2>&1; then
  echo "playground: wasm-pack is not installed; skipping (install it to build the module)" >&2
  exit 0
fi

# The assembler pins its compiler in rust-toolchain.toml, and the crate
# refuses an older one. Run from inside the crate so rustup reads that pin,
# with any ambient RUSTUP_TOOLCHAIN dropped — a version manager exports one
# for this site's directory, and it would override the pin. --out-dir gets an
# absolute path because wasm-pack resolves it against the crate; `--no-pack`
# skips the package.json nobody publishes.
out="$(pwd)/$OUT"
(cd "$SRC" && env -u RUSTUP_TOOLCHAIN wasm-pack build --quiet --target web --no-pack --no-typescript --out-dir "$out")
echo "playground: built $(wc -c < "$OUT/asm198x_web_bg.wasm" | tr -d ' ') bytes of wasm from $(git -C _asm198x describe --tags --always)"
