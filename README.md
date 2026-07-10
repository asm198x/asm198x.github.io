# asm198x.github.io

The public site for [Asm198x](https://github.com/asm198x), the 198x family's
assembler and disassembler toolchain. Astro, deployed to GitHub Pages by GitHub
Actions on every push to `main`.

## Local

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview
```

## Deploy

`.github/workflows/pages.yml` builds the site and publishes it with
`actions/deploy-pages`. The repo's Pages source must be set to **GitHub
Actions** (Settings → Pages). No branch juggling; `dist/` is never committed.

Part of the 198x family. Design and house style mirror
[emu198x.github.io](https://github.com/emu198x/emu198x.github.io).
