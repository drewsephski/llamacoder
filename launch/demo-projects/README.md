# Squid launch demo projects

These React and TypeScript demos run inside the isolated launch renderer. They do not add production Next.js routes or alter Squid application behavior.

## Routes

- FieldFlow: `/launch-demo/fieldflow`
- LaunchOps: `/launch-demo/launchops`
- Cinder Studio: `/launch-demo/cinder-studio`

Each demo includes stable detail routes, deterministic query-controlled states, responsive layouts, and a hidden controller available with `demoControls=1`.

## Capture

Run `pnpm launch:capture-demos`. The script starts or connects to the Vite launch renderer, probes all six demo states, fails on browser console errors, captures exact desktop and mobile PNGs, records and transcodes a 12-second MP4, validates dimensions and duration, generates contact sheets, and writes checksummed manifests under `launch/screenshots/<demo-name>/`.

The demos use fictional sample data only. LaunchOps integrations and authentication are explicitly mocked. Cinder Studio imagery was generated specifically for this repository and is stored locally.
