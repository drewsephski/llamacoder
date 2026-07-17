export const generatedAppDependencies: Record<string, string> = {
  "lucide-react": "0.563.0",
  recharts: "2.9.0",
  "react-router-dom": "6.30.4",
  "@radix-ui/react-accordion": "^1.2.0",
  "@radix-ui/react-alert-dialog": "^1.1.1",
  "@radix-ui/react-aspect-ratio": "^1.1.0",
  "@radix-ui/react-avatar": "^1.1.0",
  "@radix-ui/react-checkbox": "^1.1.1",
  "@radix-ui/react-collapsible": "^1.1.0",
  "@radix-ui/react-dialog": "^1.1.1",
  "@radix-ui/react-dropdown-menu": "^2.1.1",
  "@radix-ui/react-hover-card": "^1.1.1",
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-menubar": "^1.1.1",
  "@radix-ui/react-navigation-menu": "^1.2.0",
  "@radix-ui/react-popover": "^1.1.1",
  "@radix-ui/react-progress": "^1.1.0",
  "@radix-ui/react-radio-group": "^1.2.0",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "@radix-ui/react-select": "^2.1.1",
  "@radix-ui/react-separator": "^1.1.0",
  "@radix-ui/react-slider": "^1.2.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-switch": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-toast": "^1.2.1",
  "@radix-ui/react-toggle": "^1.1.0",
  "@radix-ui/react-toggle-group": "^1.1.0",
  "@radix-ui/react-tooltip": "^1.1.2",
  "@hookform/resolvers": "5.4.0",
  "@tanstack/react-query": "5.101.2",
  "@tanstack/react-table": "8.21.3",
  "@xyflow/react": "12.11.2",
  "class-variance-authority": "^0.7.0",
  clsx: "^2.1.1",
  "date-fns": "^3.6.0",
  "embla-carousel-react": "^8.1.8",
  "framer-motion": "^11.15.0",
  "fuse.js": "7.5.0",
  "qrcode.react": "4.2.0",
  "react-colorful": "5.8.0",
  "react-day-picker": "^8.10.1",
  "react-dnd": "16.0.1",
  "react-dnd-html5-backend": "16.0.1",
  "react-dnd-touch-backend": "16.0.1",
  "react-dropzone": "17.0.0",
  "react-hook-form": "7.81.0",
  "react-markdown": "10.1.0",
  "react-resizable-panels": "4.12.2",
  "remark-gfm": "4.0.1",
  "tailwind-merge": "^2.4.0",
  "tailwindcss-animate": "^1.0.7",
  vaul: "^0.9.1",
  zod: "4.4.3",
  zustand: "5.0.14",
};

const STATIC_IMPORT_SOURCE_REGEX =
  /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_SOURCE_REGEX = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

export function getGeneratedAppPackageName(source: string) {
  if (source.startsWith("@")) {
    return source.split("/").slice(0, 2).join("/");
  }

  return source.split("/")[0];
}

export function extractGeneratedAppImportSources(code: string) {
  const sources = new Set<string>();

  for (const pattern of [
    STATIC_IMPORT_SOURCE_REGEX,
    DYNAMIC_IMPORT_SOURCE_REGEX,
  ]) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      sources.add(match[1]);
    }
  }

  return sources;
}

export function getRequiredGeneratedAppDependencies(
  sourceFiles: Iterable<string>,
) {
  const selected: Record<string, string> = {};

  for (const code of sourceFiles) {
    for (const source of extractGeneratedAppImportSources(code)) {
      const packageName = getGeneratedAppPackageName(source);
      const version = generatedAppDependencies[packageName];
      if (version) selected[packageName] = version;
    }
  }

  return selected;
}
