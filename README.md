# Gravity Lensing

A package registry and scope for Common Lisp.

**Live site:** https://glensing.pages.dev

## About

Many of today's programming languages have been influenced by Lisp. Lisp is gravity itself. The brilliant libraries created by the great Lisp Aliens orbit within Lisp's gravitational field. Gravity Lensing lets you find Common Lisp packages through the lens of that gravity.

Currently indexes **2,382 packages** from Quicklisp.

## Project Structure

```
front/     Astro 6 + React frontend (deployed on Cloudflare Pages)
scripts/   Quicklisp import script
docs/      API schema and specs
```

## CLI Package Manager

**area51** is the CLI package manager for Gravity Lensing.

Repository: [github.com/gr8distance/area51](https://github.com/gr8distance/area51)

## Tech Stack

- **Frontend:** Astro 6, React, Three.js
- **Deployment:** Cloudflare Pages
- **i18n:** English and Japanese

## Development

```sh
cd front
bun install
bun run dev      # start dev server
bun run build    # production build
```

### Quicklisp Import

The import script fetches package data from the Quicklisp distribution:

```sh
bun scripts/import-quicklisp.ts
```

## License

Open source.
