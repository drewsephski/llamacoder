import { describe, expect, it } from "vitest";

import { detectPersistenceIntentFromText } from "@/features/generation/persistence-intent";
import {
  PORTFOLIO_PROMPT_TEMPLATE,
  compilePromptTemplate,
  createEmptyTemplateValues,
} from "@/lib/prompt-templates";

describe("persistence intent detection", () => {
  it("does not treat portfolio templates as database-backed apps", () => {
    const content = compilePromptTemplate(PORTFOLIO_PROMPT_TEMPLATE, {
      ...createEmptyTemplateValues(PORTFOLIO_PROMPT_TEMPLATE),
      fullName: "Jane Doe",
      role: "Product Designer",
      portfolioUrl: "https://janedoe.com",
      linkedinUrl: "https://linkedin.com/in/janedoe",
      style: "Editorial dark portfolio",
    });

    const intent = detectPersistenceIntentFromText(content);

    expect(intent.detected).toBe(false);
    expect(intent.recommendation).toBe("prototype");
  });
});
