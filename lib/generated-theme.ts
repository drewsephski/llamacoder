type ThemeVariables = Record<string, string>;

const lightThemeVariables: ThemeVariables = {
  background: "0 0% 100%",
  foreground: "0 0% 3.9%",
  card: "0 0% 100%",
  "card-foreground": "0 0% 3.9%",
  popover: "0 0% 100%",
  "popover-foreground": "0 0% 3.9%",
  primary: "0 0% 9%",
  "primary-foreground": "0 0% 98%",
  secondary: "0 0% 96.1%",
  "secondary-foreground": "0 0% 9%",
  muted: "0 0% 96.1%",
  "muted-foreground": "0 0% 45.1%",
  accent: "0 0% 96.1%",
  "accent-foreground": "0 0% 9%",
  destructive: "0 84.2% 60.2%",
  "destructive-foreground": "0 0% 98%",
  border: "0 0% 89.8%",
  input: "0 0% 89.8%",
  ring: "0 0% 3.9%",
  radius: "0.5rem",
};

const darkThemeVariables: ThemeVariables = {
  background: "0 0% 3.9%",
  foreground: "0 0% 98%",
  card: "0 0% 3.9%",
  "card-foreground": "0 0% 98%",
  popover: "0 0% 3.9%",
  "popover-foreground": "0 0% 98%",
  primary: "0 0% 98%",
  "primary-foreground": "0 0% 9%",
  secondary: "0 0% 14.9%",
  "secondary-foreground": "0 0% 98%",
  muted: "0 0% 14.9%",
  "muted-foreground": "0 0% 63.9%",
  accent: "0 0% 14.9%",
  "accent-foreground": "0 0% 98%",
  destructive: "0 62.8% 30.6%",
  "destructive-foreground": "0 0% 98%",
  border: "0 0% 14.9%",
  input: "0 0% 14.9%",
  ring: "0 0% 83.1%",
  radius: "0.5rem",
};

export const generatedTailwindThemeExtension = {
  colors: {
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
    },
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
} as const;

function formatVariables(selector: string, variables: ThemeVariables) {
  return [
    `${selector} {`,
    ...Object.entries(variables).map(
      ([name, value]) => `  --${name}: ${value};`,
    ),
    "}",
  ];
}

export function buildGeneratedThemeCss({
  includeTailwindDirectives = false,
}: {
  includeTailwindDirectives?: boolean;
} = {}) {
  return [
    ...(includeTailwindDirectives
      ? ["@tailwind base;", "@tailwind components;", "@tailwind utilities;", ""]
      : []),
    ...formatVariables(":root", lightThemeVariables),
    "",
    ...formatVariables(".dark", darkThemeVariables),
    "",
    ":root { color-scheme: light; }",
    ".dark { color-scheme: dark; }",
    "",
    "* {",
    "  border-color: hsl(var(--border));",
    "}",
    "",
    "html {",
    "  background-color: hsl(var(--background));",
    "  color: hsl(var(--foreground));",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  min-width: 320px;",
    "  min-height: 100vh;",
    "  background-color: hsl(var(--background));",
    "  color: hsl(var(--foreground));",
    "}",
  ].join("\n");
}

export function serializeGeneratedTailwindThemeExtension() {
  return JSON.stringify(generatedTailwindThemeExtension, null, 2);
}
