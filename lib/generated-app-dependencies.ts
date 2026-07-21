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
  gsap: "3.14.2",
  "@types/gsap": "3.0.0",
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
  three: "0.177.0",
  "@types/three": "0.177.0",
  "@react-three/fiber": "9.6.1",
  "@react-three/drei": "10.7.7",
  "@react-three/postprocessing": "3.0.4",
  postprocessing: "6.39.3",
  leva: "0.10.1",
  "@paper-design/shaders-react": "0.0.77",
  sonner: "2.0.7",
  "react-leaflet": "5.0.0",
  leaflet: "1.9.4",
  "@types/leaflet": "1.9.21",
  "react-syntax-highlighter": "15.8.0",
  "react-intersection-observer": "9.16.0",
  cmdk: "1.1.1",
  "hls.js": "1.6.16",
  "@uiw/react-md-editor": "4.0.6",
  "@use-gesture/react": "10.3.1",
  "react-countup": "6.5.3",
  "react-resizable": "3.0.4",
  "@types/react-resizable": "3.0.8",
  "@tanstack/react-virtual": "3.14.7",
  jspdf: "4.2.1",
  "@react-pdf/renderer": "4.5.1",
  howler: "2.2.4",
  "react-arborist": "3.15.0",
  "react-confetti": "6.4.0",
  "react-masonry-css": "1.0.16",
  "yet-another-react-lightbox": "3.32.1",
  "@tsparticles/react": "4.3.2",
  "@tsparticles/engine": "4.3.2",
  "@tsparticles/slim": "4.3.2",
  "react-parallax": "3.5.2",
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
