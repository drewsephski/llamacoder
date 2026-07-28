import type { AppSpec } from "@/features/generation/app-spec";
import {
  selectStylePackId,
  type StylePackId,
} from "@/features/generation/style-packs";

export type DesignScope =
  | "component"
  | "focused-utility"
  | "product-workbench"
  | "editorial"
  | "marketing";

export type ResolvedHallmarkBrief = {
  scope: DesignScope;
  audience: string;
  primaryJob: string;
  tone: string;
  macrostructure: string;
  stylePack: StylePackId | null;
  navigation: string;
  footer: string;
  preserve: string[];
  avoid: string[];
};

export type EffectiveBrief = {
  originalIntent: string;
  approvedSpec: string;
  latestUserRequest: string;
  design: ResolvedHallmarkBrief;
};

const COMPONENT_RE =
  /\b(button|input|card|modal|dropdown|tooltip|select|checkbox|switch|tabs?|chip|badge|banner|snackbar|popover|slider|date picker|avatar|component)\b/i;
const EDITORIAL_RE =
  /\b(editorial|article|story|publication|magazine|blog|document)\b/i;
const MARKETING_RE =
  /\b(landing|marketing|homepage|launch|waitlist|portfolio|campaign)\b/i;
const WORKBENCH_RE =
  /\b(dashboard|editor|workspace|workbench|admin|console|canvas|inspector|workflow|crm|analytics)\b/i;
const DESIGN_OVERRIDE_RE =
  /\b(light|dark|editorial|brutalist|minimal|luxury|playful|technical|austere|atmospheric|palette|color|colour|typography|font|layout|theme|style|animation|motion|nav|footer)\b/i;
const STRUCTURAL_TARGET =
  "(?:landing(?: page)?|marketing(?: site| page)?|homepage|publication|magazine|blog|document|dashboard|editor|workspace|workbench|utility|component)";
const STRUCTURAL_OVERRIDE_PATTERNS = [
  new RegExp(
    `\\b(?:turn|convert|rebuild|redesign|restructure|transform|change)\\b[\\s\\S]{0,80}\\b(?:into|as|to)\\b[\\s\\S]{0,40}\\b${STRUCTURAL_TARGET}\\b`,
    "i",
  ),
  new RegExp(
    `\\bmake\\b[\\s\\S]{0,80}\\b(?:a|an)\\s+${STRUCTURAL_TARGET}\\b`,
    "i",
  ),
  new RegExp(
    `\\breplace\\b[\\s\\S]{0,80}\\bwith\\b[\\s\\S]{0,40}\\b(?:a|an|the)?\\s*${STRUCTURAL_TARGET}\\b`,
    "i",
  ),
];

function hasStructuralOverride(text: string): boolean {
  return STRUCTURAL_OVERRIDE_PATTERNS.some((pattern) => pattern.test(text));
}

function resolveScope(text: string): DesignScope {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 30 && COMPONENT_RE.test(text)) return "component";
  if (EDITORIAL_RE.test(text)) return "editorial";
  if (MARKETING_RE.test(text)) return "marketing";
  if (WORKBENCH_RE.test(text)) return "product-workbench";
  return "focused-utility";
}

function resolveTone(spec: AppSpec, latest: string): string {
  const explicit = latest.match(
    /\b(editorial|brutalist|soft|utilitarian|luxury|playful|technical|austere|atmospheric|minimal(?:ist)?)\b/i,
  )?.[1];
  return explicit ?? spec.design.visualDirection ?? "purposeful and restrained";
}

function resolveStructure(scope: DesignScope) {
  switch (scope) {
    case "component":
      return {
        macrostructure: "none (component scope)",
        navigation: "preserve-existing",
        footer: "none",
      };
    case "product-workbench":
      return {
        macrostructure: "Workbench",
        navigation: "integrated-toolbar",
        footer: "none",
      };
    case "editorial":
      return {
        macrostructure: "Long Document",
        navigation: "editorial-masthead",
        footer: "colophon",
      };
    case "marketing":
      return {
        macrostructure: "Marquee Hero",
        navigation: "information-architecture-led",
        footer: "statement-or-index",
      };
    default:
      return {
        macrostructure: "Focused Single-Task",
        navigation: "none",
        footer: "none",
      };
  }
}

export function resolveEffectiveBrief(input: {
  originalIntent?: string | null;
  latestUserRequest: string;
  appSpec: AppSpec;
  latestRequestIsInitialBuild?: boolean;
}): EffectiveBrief {
  const originalIntent = input.originalIntent?.trim() ?? "";
  const latestUserRequest = input.latestUserRequest.trim();
  const spec = input.appSpec;
  const establishedProductContext = [
    spec.overview.purpose,
    spec.overview.appType,
    ...spec.features.mustHave,
    originalIntent,
  ]
    .filter(Boolean)
    .join("\n");
  const latestCanSetStructure =
    input.latestRequestIsInitialBuild === true ||
    !establishedProductContext ||
    hasStructuralOverride(latestUserRequest);
  const productContext = latestCanSetStructure
    ? [establishedProductContext, latestUserRequest].filter(Boolean).join("\n")
    : establishedProductContext;
  const scope = resolveScope(productContext);
  const structure = resolveStructure(scope);
  const approvedDesign = [
    spec.design.visualDirection,
    spec.design.colors?.join(", "),
    spec.design.typography,
    spec.design.layout,
  ]
    .filter(Boolean)
    .join("; ");
  const designInput = DESIGN_OVERRIDE_RE.test(latestUserRequest)
    ? latestUserRequest
    : approvedDesign || originalIntent || latestUserRequest;

  return {
    originalIntent,
    approvedSpec: [
      spec.overview.purpose,
      spec.features.mustHave.length
        ? `Must-have: ${spec.features.mustHave.join("; ")}`
        : "",
      spec.acceptanceCriteria.length
        ? `Acceptance: ${spec.acceptanceCriteria.join("; ")}`
        : "",
      spec.features.excluded?.length
        ? `Excluded: ${spec.features.excluded.join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    latestUserRequest,
    design: {
      scope,
      audience: spec.overview.audience?.join(", ") || "the intended end user",
      primaryJob:
        spec.userFlows[0]?.description ||
        spec.overview.purpose ||
        latestUserRequest ||
        originalIntent,
      tone: resolveTone(spec, latestUserRequest),
      macrostructure: structure.macrostructure,
      stylePack: selectStylePackId(designInput),
      navigation: structure.navigation,
      footer: structure.footer,
      preserve: [
        "existing routes",
        "existing workflows and data handling",
        "unaffected copy and component ownership",
      ],
      avoid: [
        "marketing hero for a product tool",
        "three equal feature cards",
        "fabricated proof or metrics",
        "unrequested navigation or footer chrome",
      ],
    },
  };
}

export function serializeEffectiveBrief(brief: EffectiveBrief): string {
  return [
    "=== EFFECTIVE BRIEF (authoritative precedence) ===",
    "Precedence: latest explicit user instruction > approved specification > existing app constraints > inferred Hallmark direction > default Style Pack.",
    `Latest user request: ${brief.latestUserRequest || "none"}`,
    `Approved specification: ${brief.approvedSpec || "none"}`,
    `Original intent (context only): ${brief.originalIntent || "none"}`,
    "Resolved Hallmark design brief:",
    JSON.stringify(brief.design, null, 2),
    "A Style Pack is an implementation aid only. It must never override the latest request or approved specification.",
    "=== END EFFECTIVE BRIEF ===",
  ].join("\n");
}
