export const generatedAppCapabilityContract = [
  "**Generated-app capability contract:**",
  "- React DnD: use `react-dnd` with `react-dnd-html5-backend` for precise desktop drag-and-drop. For touch-first or coarse-pointer experiences, use `react-dnd-touch-backend`. Every drag action needs a visible non-drag or keyboard-accessible alternative.",
  "- Forms and validation: use `react-hook-form`, `zod`, and `@hookform/resolvers/zod` for non-trivial forms, dynamic fields, and typed validation. Prefer the installed `@/components/ui/form` wrapper. Native HTML validation is enough for a single simple field.",
  "- Server state: use `@tanstack/react-query` only for real asynchronous server/API state that benefits from caching, mutations, pagination, or background refresh. Mount one `QueryClientProvider` at the app root. Query functions must still use the reviewed typed client, native fetch, timeouts, response.ok checks, and Zod or exact type-guard validation.",
  "- Shared client state: use `zustand` only when state is shared across several distant components or needs browser persistence; otherwise use React state. Persist only minimal non-sensitive fields with a versioned key, a storage version/migration, and error-safe browser storage. Never persist tokens, secrets, or unnecessary API responses.",
  "- Data grids: use `@tanstack/react-table` for sorting, filtering, pagination, selection, or column visibility. Use the installed Shadcn Table alone for simple static tabular content.",
  "- Resizable workspaces: use `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` from `@/components/ui/resizable`; do not recreate resize logic manually.",
  "- File selection: use `react-dropzone` for accessible local file picking, drag feedback, type/size validation, and previews. It does not upload files; never claim remote upload success without a reviewed server integration.",
  "- Node editors: use `@xyflow/react` only for genuine node/edge canvases such as workflows or diagrams, and import `@xyflow/react/dist/style.css` exactly once. Give the canvas an explicit height and preserve keyboard-accessible controls.",
  "- Markdown: use `react-markdown` with `remark-gfm` for trusted Markdown rendering. Do not enable raw HTML or use `dangerouslySetInnerHTML`.",
  "- Local search: use the default export from `fuse.js` for meaningful fuzzy search over in-memory data; use ordinary array filtering for exact or tiny searches.",
  "- Color input: use named exports such as `HexColorPicker` from `react-colorful` only for actual theme/design controls, with a labeled text fallback for keyboard entry.",
  "- QR codes: use `QRCodeSVG` or `QRCodeCanvas` from `qrcode.react` for user-provided or app-derived values, with an accessible text representation of the encoded value.",
  "- No other packages are available. Do not import React Router, axios, alternate chart/date/toast/carousel/animation libraries, or a competing drag-and-drop framework.",
].join("\n");

export const generatedAppRepairCapabilityRules = [
  "- Use only installed generated-app libraries and exact package names from the capability contract.",
  "- Preserve required provider setup: QueryClientProvider for TanStack Query and DndProvider for React DnD.",
  "- Import `@xyflow/react/dist/style.css` exactly once when React Flow is used.",
  "- File dropzones select local files only; do not invent successful uploads.",
  "- Render Markdown without raw HTML, and never persist secrets or tokens in Zustand/localStorage.",
].join("\n");
