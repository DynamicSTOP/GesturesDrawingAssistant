
`pnpm install` rebilds all native modules

`pnpm run build` compiles both main (tsc) and renderer (Vite)

`pnpm run lint` checks for errors

`pnpm run release` build for the current platform. To cross-compile (e.g., build Windows from Linux), you'd pass `--win` / `--mac` / `--linux` flags: `pnpm run release -- --win`


``