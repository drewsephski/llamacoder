import dedent from "dedent";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

export const DESIGN_SCORE_DIMENSIONS = [
  "philosophy",
  "hierarchy",
  "execution",
  "specificity",
  "restraint",
  "variety",
] as const;

export type DesignScoreDimension = (typeof DESIGN_SCORE_DIMENSIONS)[number];

export type DesignScores = Record<DesignScoreDimension, number>;

export type DesignScoreSummary = {
  scores: DesignScores;
  average: number;
  weakDimensions: DesignScoreDimension[];
  generationCount: number;
};

const designScoresSchema = z.object({
  philosophy: z.number().min(1).max(5),
  hierarchy: z.number().min(1).max(5),
  execution: z.number().min(1).max(5),
  specificity: z.number().min(1).max(5),
  restraint: z.number().min(1).max(5),
  variety: z.number().min(1).max(5),
});

const WEAK_THRESHOLD = 3;
const MIN_HISTORY_FOR_ADJUSTMENT = 2;
const MAX_HISTORY_LOOKBACK = 5;

/**
 * Extract design quality scores from the model's private critique output.
 * The model is prompted to score Philosophy, Hierarchy, Execution, Specificity,
 * Restraint, and Variety from 1-5 at the end of its output.
 */
export function extractDesignScores(text: string): DesignScores | null {
  const scores: Partial<DesignScores> = {};

  for (const dimension of DESIGN_SCORE_DIMENSIONS) {
    const pattern = new RegExp(
      `${dimension}:?\\s*\\**\\s*(\\d)\\s*(?:\\/\\s*5|\\**)`,
      "i",
    );
    const match = text.match(pattern);
    if (match) {
      scores[dimension] = parseInt(match[1], 10);
    }
  }

  if (Object.keys(scores).length < DESIGN_SCORE_DIMENSIONS.length) {
    return null;
  }

  const parsed = designScoresSchema.safeParse(scores);
  return parsed.success ? parsed.data : null;
}

/**
 * Persist design scores for a generation message.
 */
export async function saveDesignScores(
  messageId: string,
  scores: DesignScores,
): Promise<void> {
  try {
    const prisma = getPrisma();
    await prisma.message.update({
      where: { id: messageId },
      data: { designScores: scores satisfies Record<string, number> },
    });
  } catch (error) {
    console.warn("Failed to persist design scores:", error);
  }
}

/**
 * Retrieve recent design scores for a chat to inform the next generation.
 */
export async function getRecentDesignScores(
  chatId: string,
): Promise<DesignScoreSummary | null> {
  try {
    const prisma = getPrisma();
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        role: "assistant",
      },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY_LOOKBACK,
      select: { designScores: true },
    });

    const allScores = messages
      .map((m) => m.designScores as DesignScores | null)
      .filter(
        (s): s is DesignScores =>
          s !== null && typeof s === "object" && "philosophy" in s,
      );

    if (allScores.length === 0) return null;

    const aggregated: DesignScores = {
      philosophy: 0,
      hierarchy: 0,
      execution: 0,
      specificity: 0,
      restraint: 0,
      variety: 0,
    };

    for (const scores of allScores) {
      for (const dim of DESIGN_SCORE_DIMENSIONS) {
        aggregated[dim] += scores[dim];
      }
    }

    for (const dim of DESIGN_SCORE_DIMENSIONS) {
      aggregated[dim] =
        Math.round((aggregated[dim] / allScores.length) * 10) / 10;
    }

    const average =
      DESIGN_SCORE_DIMENSIONS.reduce((sum, dim) => sum + aggregated[dim], 0) /
      DESIGN_SCORE_DIMENSIONS.length;

    const weakDimensions = DESIGN_SCORE_DIMENSIONS.filter(
      (dim) => aggregated[dim] < WEAK_THRESHOLD,
    );

    return {
      scores: aggregated,
      average: Math.round(average * 10) / 10,
      weakDimensions,
      generationCount: allScores.length,
    };
  } catch (error) {
    console.warn("Failed to retrieve design scores:", error);
    return null;
  }
}

type EmphasisInstruction = {
  dimension: DesignScoreDimension;
  instruction: string;
};

const EMPHASIS_INSTRUCTIONS: Record<DesignScoreDimension, string> = {
  philosophy: dedent`
    HIERARCHY FOCUS (based on past generations):
    Your previous designs scored low on Hierarchy. This generation, you must:
    - Make the primary task and next action obvious within 3 seconds
    - Give secondary controls strictly less visual weight
    - Group related controls by proximity, not by wrapping them in identical cards
    - Use whitespace as the primary structural tool before adding any visual separators
    - Before emitting files, verify that a new user could identify the main action without reading any labels
  `,
  hierarchy: dedent`
    HIERARCHY FOCUS (based on past generations):
    Your previous designs scored low on Hierarchy. This generation, you must:
    - Make the primary task and next action obvious within 3 seconds
    - Give secondary controls strictly less visual weight
    - Group related controls by proximity, not by wrapping them in identical cards
    - Use whitespace as the primary structural tool before adding any visual separators
    - Before emitting files, verify that a new user could identify the main action without reading any labels
  `,
  execution: dedent`
    EXECUTION FOCUS (based on past generations):
    Your previous designs scored low on Execution. This generation, you must:
    - Complete every interaction end-to-end: input → validate → submit → feedback
    - Implement all interactive states: hover, active, focus-visible, disabled, loading, error, empty
    - Wire every button to a real handler; no inert controls or empty onClick
    - Use Dialog/AlertDialog/Drawer appropriately for the workflow
    - Add toast feedback for every completed mutation
  `,
  specificity: dedent`
    SPECIFICITY FOCUS (based on past generations):
    Your previous designs scored low on Specificity. This generation, you must:
    - Ground every design choice in the subject's world, not in generic SaaS patterns
    - Use subject-specific content: real names, real data, real terminology
    - Choose a page archetype that fits this specific content, not a template
    - Pick nav and footer archetypes tied to the actual information architecture
    - Keep nav in a centered shell (\`max-w-*\` + \`mx-auto\`) with equal side gutters at desktop and collapsed/mobile breakpoints
    - Replace every generic label ("Submit", "Click here") with a concrete action verb
  `,
  restraint: dedent`
    RESTRAINT FOCUS (based on past generations):
    Your previous designs scored low on Restraint. This generation, you must:
    - Remove one unnecessary visual flourish from your plan
    - Use exactly one containment layer (no card-in-card nesting)
    - Apply gradient, shadow, or glow to at most one surface
    - Keep one icon family throughout; do not mix styles
    - Use copy that is functional, not decorative — no "Unleash", "Elevate", "Seamless"
  `,
  variety: dedent`
    VARIETY FOCUS (based on past generations):
    Your previous designs scored low on Variety. This generation, you must:
    - Choose a different page archetype than the last app in this session
    - Vary nav treatment: if the last app used a wordmark+links nav, use something else
    - Verify the new nav treatment remains centered at desktop and at 320/375/414/768px widths, with no drifting edge lock
    - Pick a different accent hue family from the last generation
    - Mix tight and generous spacing intentionally rather than uniform padding
    - Ensure the section rhythm follows the content, not a reusable template
  `,
};

/**
 * Build dynamic prompt emphasis sections based on historical design scores.
 * Returns instructions that should be injected into the system prompt when
 * the model has consistently scored low on specific dimensions.
 */
export function buildDesignEmphasis(
  summary: DesignScoreSummary | null,
): string {
  if (!summary || summary.generationCount < MIN_HISTORY_FOR_ADJUSTMENT) {
    return "";
  }

  if (summary.weakDimensions.length === 0) {
    return "";
  }

  const instructions: EmphasisInstruction[] = summary.weakDimensions.map(
    (dimension) => ({
      dimension,
      instruction: EMPHASIS_INSTRUCTIONS[dimension],
    }),
  );

  const header = dedent`
    ## Dynamic quality emphasis (auto-generated from your past ${summary.generationCount} generations in this chat)

    Your recent average design scores: Philosophy ${summary.scores.philosophy}, Hierarchy ${summary.scores.hierarchy}, Execution ${summary.scores.execution}, Specificity ${summary.scores.specificity}, Restraint ${summary.scores.restraint}, Variety ${summary.scores.variety} (overall ${summary.average}/5).

    The following dimensions scored below ${WEAK_THRESHOLD}/5 and need extra attention this generation:
  `;

  const body = instructions
    .map(
      (inst) =>
        `\n### ${inst.dimension.charAt(0).toUpperCase() + inst.dimension.slice(1)}\n${inst.instruction}`,
    )
    .join("\n");

  return header + body;
}

/**
 * Parse the design scores critique section from model output so it can be
 * stripped before presenting the response to the user (optional).
 */
export function stripDesignScoresSection(text: string): string {
  return text
    .replace(
      /(?:^|\n)\s*(?:##?\s*)?(?:Private\s+)?(?:Design\s+)?(?:Quality\s+)?(?:Critique|Sc?ore)[\s\S]*?(?=\n\s*(?:##?\s*[A-Z])|\n\s*```|$)/i,
      "",
    )
    .trim();
}
