import { describe, expect, test } from "vitest";

import {
  COMPANY_LANDING_PROMPT_TEMPLATE,
  compilePromptTemplate,
  createEmptyTemplateValues,
  getMissingRequiredTemplateFields,
  isPromptTemplateReady,
  LIVE_API_DASHBOARD_PROMPT_TEMPLATE,
  LOCAL_BUSINESS_PROMPT_TEMPLATE,
  parsePromptTemplateBody,
  PORTFOLIO_PROMPT_TEMPLATE,
  PROMPT_TEMPLATES,
} from "@/lib/prompt-templates";

describe("prompt templates", () => {
  test("parses template placeholders into text and field segments", () => {
    expect(parsePromptTemplateBody("Hello {fullName}, build {role}.")).toEqual([
      { kind: "text", value: "Hello " },
      { kind: "field", fieldId: "fullName" },
      { kind: "text", value: ", build " },
      { kind: "field", fieldId: "role" },
      { kind: "text", value: "." },
    ]);
  });

  test("exposes the guided research template set", () => {
    expect(PROMPT_TEMPLATES.map((template) => template.id)).toEqual([
      "portfolio",
      "company-landing",
      "live-api-dashboard",
      "local-business",
    ]);
  });

  test("compiles portfolio template with research instructions and real values", () => {
    const values = {
      ...createEmptyTemplateValues(PORTFOLIO_PROMPT_TEMPLATE),
      fullName: "Jane Doe",
      role: "Product Designer",
      portfolioUrl: "https://janedoe.com",
      linkedinUrl: "https://linkedin.com/in/janedoe",
      style: "Editorial dark portfolio",
    };

    const compiled = compilePromptTemplate(PORTFOLIO_PROMPT_TEMPLATE, values);

    expect(compiled).toContain("Jane Doe");
    expect(compiled).toContain("Product Designer");
    expect(compiled).toContain("https://janedoe.com");
    expect(compiled).toContain(
      "research their professional background on the web",
    );
    expect(compiled).toContain("fetch_url");
    expect(compiled).toContain("Do not invent placeholder");
  });

  test("omits optional portfolio sections when values are blank", () => {
    const values = {
      ...createEmptyTemplateValues(PORTFOLIO_PROMPT_TEMPLATE),
      fullName: "Jane Doe",
      role: "Product Designer",
    };

    const compiled = compilePromptTemplate(PORTFOLIO_PROMPT_TEMPLATE, values);

    expect(compiled).not.toContain("{portfolioUrl}");
    expect(compiled).not.toContain("{linkedinUrl}");
    expect(compiled).not.toContain("{style}");
    expect(compiled).toContain("Jane Doe");
  });

  test("tracks required fields for template readiness", () => {
    const values = createEmptyTemplateValues(PORTFOLIO_PROMPT_TEMPLATE);

    expect(
      getMissingRequiredTemplateFields(PORTFOLIO_PROMPT_TEMPLATE, values),
    ).toHaveLength(2);
    expect(isPromptTemplateReady(PORTFOLIO_PROMPT_TEMPLATE, values)).toBe(
      false,
    );

    values.fullName = "Jane Doe";
    values.role = "Designer";

    expect(isPromptTemplateReady(PORTFOLIO_PROMPT_TEMPLATE, values)).toBe(true);
  });

  test("compiles company landing template with research and product URL", () => {
    const values = {
      ...createEmptyTemplateValues(COMPANY_LANDING_PROMPT_TEMPLATE),
      companyName: "Acme",
      productName: "Acme Cloud",
      productUrl: "https://acme.com",
      audience: "Startup CTOs",
      cta: "Start free trial",
      competitorUrls: "https://competitor.com",
      style: "Crisp SaaS",
    };

    const compiled = compilePromptTemplate(
      COMPANY_LANDING_PROMPT_TEMPLATE,
      values,
    );

    expect(compiled).toContain("Acme");
    expect(compiled).toContain("Acme Cloud");
    expect(compiled).toContain("https://acme.com");
    expect(compiled).toContain("research Acme on the web");
    expect(compiled).toContain("fetch_url");
    expect(compiled).toContain("Do not invent customers");
  });

  test("compiles live API dashboard template with docs verification", () => {
    const values = {
      ...createEmptyTemplateValues(LIVE_API_DASHBOARD_PROMPT_TEMPLATE),
      appName: "Orbit Monitor",
      docsUrl: "https://docs.example.com/api",
      dataFocus: "current weather forecasts by city",
      apiBaseUrl: "https://api.example.com",
      authNote: "publishable key via VITE_API_KEY",
    };

    const compiled = compilePromptTemplate(
      LIVE_API_DASHBOARD_PROMPT_TEMPLATE,
      values,
    );

    expect(compiled).toContain("Orbit Monitor");
    expect(compiled).toContain("https://docs.example.com/api");
    expect(compiled).toContain("from a public API");
    expect(compiled).toContain("fetch_url");
    expect(compiled).toContain("Do not invent endpoints");
  });

  test("compiles local business template with city and listing research", () => {
    const values = {
      ...createEmptyTemplateValues(LOCAL_BUSINESS_PROMPT_TEMPLATE),
      businessName: "Rivera Kitchen",
      city: "Austin, TX",
      businessType: "neighborhood Mexican restaurant",
      websiteUrl: "https://riverakitchen.com",
      listingUrl: "https://maps.google.com/?cid=123",
    };

    const compiled = compilePromptTemplate(
      LOCAL_BUSINESS_PROMPT_TEMPLATE,
      values,
    );

    expect(compiled).toContain("Rivera Kitchen");
    expect(compiled).toContain("Austin, TX");
    expect(compiled).toContain("https://riverakitchen.com");
    expect(compiled).toContain("research Rivera Kitchen on the web");
    expect(compiled).toContain("Do not invent awards");
  });
});
