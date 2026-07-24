import type ts from "typescript";

import {
  findIntegrationProviderByUrl,
  getIntegrationProvider,
  type IntegrationPolicyStatus,
} from "@/features/integrations/registry";

export type ApiIntegrationIssue = {
  path?: string;
  message: string;
};

export type GeneratedIntegrationProvider = {
  id: string;
  name: string;
  policyStatus: IntegrationPolicyStatus;
  runtime: "browser" | "server";
  commercialUse: "allowed" | "restricted" | "review_required";
  docsUrl: string;
  matchedEndpoints: string[];
};

export type GeneratedApiIntegrationReport = {
  status: "not_detected" | "verified" | "setup_required" | "blocked";
  requestsDetected: number;
  endpoints: string[];
  environmentVariables: string[];
  providers: GeneratedIntegrationProvider[];
  policyWarnings: string[];
  issues: ApiIntegrationIssue[];
};

type SourceFile = { path: string; code: string };

type TaskUiControl = {
  functionName: string | null;
  accessibleName: string;
  hasAction: boolean;
  hasDisabledState: boolean;
  hidden: boolean;
  iconNames: string[];
  handlerNames: string[];
};

type AuthenticatedTasksUiAnalysis = {
  editControls: TaskUiControl[];
  titleInputs: TaskUiControl[];
  saveControls: TaskUiControl[];
  cancelControls: TaskUiControl[];
  logoutControls: TaskUiControl[];
  inaccessibleIconButtons: TaskUiControl[];
  titleUpdateFunctions: Set<string>;
  titleUpdateIsFiltered: boolean;
  titleUpdatePreservesCompletion: boolean;
  mutatesUserId: boolean;
  saveReachesTitleUpdate: boolean;
  saveHasLoadingAndErrorFeedback: boolean;
};

const FETCH_PATTERN = /\bfetch\s*\(/g;
const URL_PATTERN = /https?:\/\/[^\s"'`)<>{]+/g;
const ENV_PATTERN = /\bimport\.meta\.env\.([A-Z][A-Z0-9_]*)\b/g;
const SECRET_NAME_PATTERN =
  /(?:SECRET|PRIVATE|SERVER|ADMIN|SERVICE_ROLE|PASSWORD)/i;
const HARDCODED_SECRET_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|private[_-]?key)\b\s*[:=]\s*["'`]([A-Za-z0-9_\-./+=]{12,})["'`]/gi;
const HARDCODED_AUTH_PATTERN =
  /\b(?:authorization|x-api-key|api-key)\b\s*[:=]\s*["'`](?:Bearer\s+)?([A-Za-z0-9_\-./+=]{12,})["'`]/gi;
const FORBIDDEN_BROWSER_HEADER_PATTERN =
  /["'`](?:User-Agent|Origin|Host|Referer|Cookie|Content-Length)["'`]\s*:/gi;

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function matches(code: string, pattern: RegExp) {
  pattern.lastIndex = 0;
  return pattern.test(code);
}

function collectMatches(code: string, pattern: RegExp, group = 0) {
  const values: string[] = [];
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) values.push(match[group]);
  return values;
}

function jsxTagName(node: ts.JsxOpeningLikeElement) {
  return node.tagName.getText();
}

function jsxAttribute(
  compiler: typeof ts,
  node: ts.JsxOpeningLikeElement,
  name: string,
): ts.JsxAttribute | null {
  const attribute = node.attributes.properties.find(
    (candidate): candidate is ts.JsxAttribute =>
      compiler.isJsxAttribute(candidate) && candidate.name.getText() === name,
  );
  return attribute ?? null;
}

function staticJsxAttributeValue(
  compiler: typeof ts,
  attribute: ts.JsxAttribute | null,
) {
  if (!attribute?.initializer) return "";
  if (compiler.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }
  if (!compiler.isJsxExpression(attribute.initializer)) return "";
  const expression = attribute.initializer.expression;
  if (!expression) return "";
  if (
    compiler.isStringLiteral(expression) ||
    compiler.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.text;
  }
  if (compiler.isTemplateExpression(expression)) {
    return [
      expression.head.text,
      ...expression.templateSpans.map((span) => span.literal.text),
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (compiler.isConditionalExpression(expression)) {
    return [expression.whenTrue, expression.whenFalse]
      .map((branch) => {
        if (
          compiler.isStringLiteral(branch) ||
          compiler.isNoSubstitutionTemplateLiteral(branch)
        ) {
          return branch.text;
        }
        if (compiler.isTemplateExpression(branch)) {
          return [
            branch.head.text,
            ...branch.templateSpans.map((span) => span.literal.text),
          ].join(" ");
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function jsxVisibleText(
  compiler: typeof ts,
  node: ts.JsxElement | ts.JsxSelfClosingElement,
) {
  if (compiler.isJsxSelfClosingElement(node)) return "";
  const values: string[] = [];
  const visit = (child: ts.Node) => {
    if (
      compiler.isJsxOpeningElement(child) ||
      compiler.isJsxSelfClosingElement(child) ||
      compiler.isJsxClosingElement(child) ||
      compiler.isJsxOpeningFragment(child)
    ) {
      return;
    }
    if (compiler.isJsxText(child)) {
      const value = child.text.replace(/\s+/g, " ").trim();
      if (value) values.push(value);
      return;
    }
    if (compiler.isJsxExpression(child) && child.expression) {
      const collectStaticText = (expression: ts.Node) => {
        if (
          compiler.isJsxOpeningElement(expression) ||
          compiler.isJsxSelfClosingElement(expression) ||
          compiler.isJsxClosingElement(expression) ||
          compiler.isJsxOpeningFragment(expression)
        ) {
          return;
        }
        if (
          compiler.isStringLiteral(expression) ||
          compiler.isNoSubstitutionTemplateLiteral(expression)
        ) {
          values.push(expression.text);
          return;
        }
        expression.forEachChild(collectStaticText);
      };
      collectStaticText(child.expression);
      return;
    }
    child.forEachChild(visit);
  };
  node.forEachChild(visit);
  return values.join(" ");
}

function jsxIconNames(
  compiler: typeof ts,
  node: ts.JsxElement | ts.JsxSelfClosingElement,
) {
  const names: string[] = [];
  const visit = (child: ts.Node) => {
    if (
      compiler.isJsxOpeningElement(child) ||
      compiler.isJsxSelfClosingElement(child)
    ) {
      const name = jsxTagName(child);
      if (/^[A-Z]/.test(name)) names.push(name);
    }
    child.forEachChild(visit);
  };
  node.forEachChild(visit);
  return names;
}

function namedContainingFunction(
  compiler: typeof ts,
  node: ts.Node,
): string | null {
  let current: ts.Node | undefined = node;
  while (current) {
    if (
      (compiler.isFunctionDeclaration(current) ||
        compiler.isMethodDeclaration(current)) &&
      current.name
    ) {
      return current.name.getText();
    }
    if (
      (compiler.isArrowFunction(current) ||
        compiler.isFunctionExpression(current)) &&
      compiler.isVariableDeclaration(current.parent) &&
      compiler.isIdentifier(current.parent.name)
    ) {
      return current.parent.name.text;
    }
    current = current.parent;
  }
  return null;
}

function collectHandlerNames(compiler: typeof ts, node: ts.Node | undefined) {
  if (!node) return [];
  const names = new Set<string>();
  const visit = (child: ts.Node) => {
    if (
      compiler.isCallExpression(child) &&
      compiler.isIdentifier(child.expression)
    ) {
      names.add(child.expression.text);
    } else if (compiler.isIdentifier(child) && child === node) {
      names.add(child.text);
    }
    child.forEachChild(visit);
  };
  visit(node);
  return [...names];
}

function jsxControl(
  compiler: typeof ts,
  node: ts.JsxElement | ts.JsxSelfClosingElement,
): TaskUiControl {
  const opening = compiler.isJsxElement(node) ? node.openingElement : node;
  const visibleText = jsxVisibleText(compiler, node);
  const ariaLabel = staticJsxAttributeValue(
    compiler,
    jsxAttribute(compiler, opening, "aria-label"),
  );
  const title = staticJsxAttributeValue(
    compiler,
    jsxAttribute(compiler, opening, "title"),
  );
  const placeholder = staticJsxAttributeValue(
    compiler,
    jsxAttribute(compiler, opening, "placeholder"),
  );
  const className = staticJsxAttributeValue(
    compiler,
    jsxAttribute(compiler, opening, "className"),
  );
  const action = jsxAttribute(compiler, opening, "onClick");
  const actionExpression =
    action?.initializer && compiler.isJsxExpression(action.initializer)
      ? action.initializer.expression
      : undefined;
  const buttonType = staticJsxAttributeValue(
    compiler,
    jsxAttribute(compiler, opening, "type"),
  );
  let staticallyHidden = false;
  let ancestor: ts.Node | undefined = node;
  while (ancestor && !compiler.isFunctionLike(ancestor)) {
    if (
      compiler.isJsxElement(ancestor) ||
      compiler.isJsxSelfClosingElement(ancestor)
    ) {
      const ancestorOpening = compiler.isJsxElement(ancestor)
        ? ancestor.openingElement
        : ancestor;
      const ancestorClassName = staticJsxAttributeValue(
        compiler,
        jsxAttribute(compiler, ancestorOpening, "className"),
      );
      if (
        Boolean(jsxAttribute(compiler, ancestorOpening, "hidden")) ||
        /(?:^|\s)(?:hidden|invisible|sr-only|opacity-0|pointer-events-none)(?:\s|$)/.test(
          ancestorClassName,
        )
      ) {
        staticallyHidden = true;
        break;
      }
    }
    ancestor = ancestor.parent;
  }
  return {
    functionName: namedContainingFunction(compiler, node),
    accessibleName: [visibleText, ariaLabel, title, placeholder]
      .filter(Boolean)
      .join(" "),
    hasAction: Boolean(actionExpression) || buttonType === "submit",
    hasDisabledState: Boolean(jsxAttribute(compiler, opening, "disabled")),
    hidden:
      staticallyHidden ||
      Boolean(jsxAttribute(compiler, opening, "hidden")) ||
      /(?:^|\s)(?:hidden|invisible|sr-only|opacity-0|pointer-events-none)(?:\s|$)/.test(
        className,
      ),
    iconNames: jsxIconNames(compiler, node),
    handlerNames: collectHandlerNames(compiler, actionExpression),
  };
}

function propertyName(
  compiler: typeof ts,
  property: ts.ObjectLiteralElementLike,
) {
  if (
    (compiler.isPropertyAssignment(property) ||
      compiler.isShorthandPropertyAssignment(property)) &&
    property.name
  ) {
    return property.name.getText().replace(/["']/g, "");
  }
  return null;
}

function enclosingStatementText(compiler: typeof ts, node: ts.Node) {
  let current: ts.Node | undefined = node;
  while (current && !compiler.isStatement(current)) current = current.parent;
  return current?.getText() ?? node.getText();
}

function graphReaches(
  starts: Iterable<string>,
  targets: Set<string>,
  graph: Map<string, Set<string>>,
) {
  const queue = [...starts];
  const seen = new Set(queue);
  while (queue.length) {
    const current = queue.shift()!;
    if (targets.has(current)) return true;
    for (const next of graph.get(current) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
}

async function analyzeAuthenticatedTasksUi(
  files: SourceFile[],
): Promise<AuthenticatedTasksUiAnalysis> {
  const ts = (await import("typescript")).default;
  const componentGraph = new Map<string, Set<string>>();
  const callGraph = new Map<string, Set<string>>();
  const functionSources = new Map<string, string>();
  const componentAliasEdges: Array<{
    owner: string;
    from: string;
    to: string;
  }> = [];
  const roots = new Set<string>(["App"]);
  const controls: Array<{
    kind: "button" | "input";
    control: TaskUiControl;
  }> = [];
  const titleUpdateFunctions = new Set<string>();
  let titleUpdateIsFiltered = false;
  let titleUpdatePreservesCompletion = false;
  let mutatesUserId = false;

  const addEdge = (
    graph: Map<string, Set<string>>,
    from: string,
    to: string,
  ) => {
    const edges = graph.get(from) ?? new Set<string>();
    edges.add(to);
    graph.set(from, edges);
  };

  for (const file of files.filter((candidate) =>
    /\.(?:ts|tsx|js|jsx)$/i.test(candidate.path),
  )) {
    const sourceFile = ts.createSourceFile(
      file.path,
      file.code,
      ts.ScriptTarget.Latest,
      true,
      /\.[jt]sx$/i.test(file.path) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    if (/(?:^|\/)App\.[jt]sx$/i.test(file.path)) {
      for (const statement of sourceFile.statements) {
        if (
          ts.isFunctionDeclaration(statement) &&
          statement.name &&
          statement.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
          )
        ) {
          roots.add(statement.name.text);
        } else if (
          ts.isExportAssignment(statement) &&
          ts.isIdentifier(statement.expression)
        ) {
          roots.add(statement.expression.text);
        }
      }
    }
    const visit = (node: ts.Node) => {
      const owner = namedContainingFunction(ts, node);
      if (
        owner &&
        (ts.isFunctionDeclaration(node) ||
          ts.isMethodDeclaration(node) ||
          ts.isArrowFunction(node) ||
          ts.isFunctionExpression(node)) &&
        !functionSources.has(owner)
      ) {
        functionSources.set(owner, node.getText());
      }
      if (
        owner &&
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      ) {
        const tag = jsxTagName(node);
        if (/^[A-Z]/.test(tag)) addEdge(componentGraph, owner, tag);
        for (const attribute of node.attributes.properties) {
          if (
            ts.isJsxAttribute(attribute) &&
            attribute.initializer &&
            ts.isJsxExpression(attribute.initializer)
          ) {
            for (const handler of collectHandlerNames(
              ts,
              attribute.initializer.expression,
            )) {
              componentAliasEdges.push({
                owner,
                from: attribute.name.getText(),
                to: handler,
              });
            }
          }
        }
      }

      if (ts.isCallExpression(node)) {
        if (owner && ts.isIdentifier(node.expression)) {
          addEdge(callGraph, owner, node.expression.text);
        }
        if (
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === "update" &&
          node.arguments[0] &&
          ts.isObjectLiteralExpression(node.arguments[0])
        ) {
          const update = node.arguments[0];
          const names = new Set(
            update.properties
              .map((property) => propertyName(ts, property))
              .filter(Boolean) as string[],
          );
          if (names.has("user_id")) mutatesUserId = true;
          if (names.has("title")) {
            if (owner) titleUpdateFunctions.add(owner);
            const statement = enclosingStatementText(ts, node);
            titleUpdateIsFiltered ||=
              /\.from\(\s*["']tasks["']\s*\)/.test(statement) &&
              /\.eq\(\s*["']id["']\s*,/.test(statement);
            titleUpdatePreservesCompletion ||=
              !names.has("completed") &&
              !names.has("user_id") &&
              !update.properties.some(ts.isSpreadAssignment);
          }
        }
      }

      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tag = jsxTagName(opening).toLowerCase();
        if (tag === "button" || tag.endsWith("button")) {
          controls.push({ kind: "button", control: jsxControl(ts, node) });
        } else if (
          tag === "input" ||
          tag.endsWith("input") ||
          tag === "textarea"
        ) {
          const control = jsxControl(ts, node);
          controls.push({
            kind: "input",
            control: {
              ...control,
              hasAction:
                Boolean(jsxAttribute(ts, opening, "onChange")) &&
                Boolean(jsxAttribute(ts, opening, "value")),
            },
          });
        }
      }
      node.forEachChild(visit);
    };
    visit(sourceFile);
  }

  const reachableComponents = new Set<string>();
  const componentQueue = [...roots];
  while (componentQueue.length) {
    const current = componentQueue.shift()!;
    if (reachableComponents.has(current)) continue;
    reachableComponents.add(current);
    componentQueue.push(...(componentGraph.get(current) ?? []));
  }
  for (const edge of componentAliasEdges) {
    if (reachableComponents.has(edge.owner)) {
      addEdge(callGraph, edge.from, edge.to);
    }
  }
  const reachableControls = controls.filter(
    ({ control }) =>
      !control.hidden &&
      control.functionName !== null &&
      reachableComponents.has(control.functionName),
  );
  const namedButtons = reachableControls.filter(
    (candidate) => candidate.kind === "button",
  );
  const buttonMatches = (pattern: RegExp) =>
    namedButtons
      .map(({ control }) => control)
      .filter(
        (control) => control.hasAction && pattern.test(control.accessibleName),
      );
  const saveControls = buttonMatches(/\bsave\b/i);

  return {
    editControls: buttonMatches(/\bedit\b/i),
    titleInputs: reachableControls
      .filter((candidate) => candidate.kind === "input")
      .map(({ control }) => control)
      .filter(
        (control) =>
          control.hasAction &&
          /\b(?:title|task)\b/i.test(control.accessibleName),
      ),
    saveControls,
    cancelControls: buttonMatches(/\bcancel\b/i),
    logoutControls: buttonMatches(/\b(?:log\s*out|sign\s*out)\b/i),
    inaccessibleIconButtons: namedButtons
      .map(({ control }) => control)
      .filter(
        (control) =>
          control.hasAction &&
          control.iconNames.length > 0 &&
          control.accessibleName.trim().length === 0,
      ),
    titleUpdateFunctions,
    titleUpdateIsFiltered,
    titleUpdatePreservesCompletion,
    mutatesUserId,
    saveReachesTitleUpdate: graphReaches(
      saveControls.flatMap((control) => control.handlerNames),
      titleUpdateFunctions,
      callGraph,
    ),
    saveHasLoadingAndErrorFeedback: saveControls.some((control) => {
      const ownerSource = control.functionName
        ? (functionSources.get(control.functionName) ?? "")
        : "";
      return (
        control.hasDisabledState &&
        /\b(?:loading|saving|updating|isLoading|isSaving|isUpdating)\b/i.test(
          ownerSource,
        ) &&
        /\berror\b/i.test(ownerSource)
      );
    }),
  };
}

export function analyzeGeneratedApiIntegration(
  files: SourceFile[],
): GeneratedApiIntegrationReport {
  const source = files.map((file) => file.code).join("\n");
  const requestsDetected = collectMatches(source, FETCH_PATTERN).length;
  const endpoints = unique(collectMatches(source, URL_PATTERN));
  const environmentVariables = unique(collectMatches(source, ENV_PATTERN, 1));
  const issues: ApiIntegrationIssue[] = [];
  const policyWarnings: string[] = [];
  const matchedProviders = new Map<string, GeneratedIntegrationProvider>();

  for (const endpoint of endpoints) {
    const provider = findIntegrationProviderByUrl(endpoint);
    if (!provider) continue;

    const existing = matchedProviders.get(provider.id);
    if (existing) {
      existing.matchedEndpoints = unique([
        ...existing.matchedEndpoints,
        endpoint,
      ]);
      continue;
    }

    matchedProviders.set(provider.id, {
      id: provider.id,
      name: provider.name,
      policyStatus: provider.policyStatus,
      runtime: provider.runtime,
      commercialUse: provider.commercialUse,
      docsUrl: provider.docsUrl,
      matchedEndpoints: [endpoint],
    });
  }

  for (const provider of matchedProviders.values()) {
    if (provider.policyStatus === "blocked") {
      issues.push({
        message: `${provider.name} is blocked by Squid's integration policy. Choose a compliant provider or a user-controlled deployment instead.`,
      });
      continue;
    }

    if (provider.policyStatus === "conditional") {
      policyWarnings.push(
        `${provider.name} requires setup or policy review before production use.`,
      );
    }
    if (provider.runtime === "server") {
      policyWarnings.push(
        `${provider.name} requires a server-side integration for reliable or authenticated use.`,
      );
    }
    if (provider.commercialUse !== "allowed") {
      policyWarnings.push(
        `${provider.name} commercial-use terms must be reviewed before deployment.`,
      );
    }
  }

  const providers = Array.from(matchedProviders.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const file of files) {
    if (!matches(file.code, FETCH_PATTERN)) continue;

    if (!/\bresponse\.ok\b|\b[a-zA-Z_$][\w$]*\.ok\b/.test(file.code)) {
      issues.push({
        path: file.path,
        message:
          "Live API requests must reject non-success HTTP responses before reading data.",
      });
    }
    if (!/\bAbortController\b/.test(file.code)) {
      issues.push({
        path: file.path,
        message:
          "Live API requests must use AbortController to enforce a timeout.",
      });
    }
    if (
      !/\b(?:retry|retries|attempt|attempts|maxAttempts|MAX_ATTEMPTS|MAX_RETRIES|RETRY_COUNT|backoff|tries)\b/i.test(
        file.code,
      )
    ) {
      issues.push({
        path: file.path,
        message: "Live API requests must include a bounded retry path.",
      });
    }
    if (
      !/\b(?:is[A-Z][A-Za-z0-9]*|validate[A-Z][A-Za-z0-9]*|safeParse|Array\.isArray)\b/.test(
        file.code,
      )
    ) {
      issues.push({
        path: file.path,
        message:
          "Live API responses must be validated at runtime before rendering.",
      });
    }
    if (matches(file.code, FORBIDDEN_BROWSER_HEADER_PATTERN)) {
      issues.push({
        path: file.path,
        message:
          "Browser fetch must not set forbidden request headers such as User-Agent, Origin, Host, Referer, Cookie, or Content-Length.",
      });
    }
  }

  for (const file of files) {
    for (const _value of collectMatches(
      file.code,
      HARDCODED_SECRET_PATTERN,
      1,
    )) {
      issues.push({
        path: file.path,
        message:
          "Hard-coded API credentials are forbidden in generated browser code.",
      });
    }
    for (const _value of collectMatches(file.code, HARDCODED_AUTH_PATTERN, 1)) {
      issues.push({
        path: file.path,
        message:
          "Secret-bearing authorization headers are forbidden in generated browser code.",
      });
    }
  }

  for (const variable of environmentVariables) {
    if (!variable.startsWith("VITE_")) {
      issues.push({
        message: `Browser environment variable ${variable} must use the VITE_ prefix.`,
      });
    }
    if (SECRET_NAME_PATTERN.test(variable)) {
      issues.push({
        message: `Environment variable ${variable} appears secret-bearing and cannot be exposed to the browser.`,
      });
    }
  }

  if (requestsDetected === 0) {
    return {
      status:
        issues.length > 0
          ? "blocked"
          : environmentVariables.length > 0 || policyWarnings.length > 0
            ? "setup_required"
            : "not_detected",
      requestsDetected,
      endpoints,
      environmentVariables,
      providers,
      policyWarnings: unique(policyWarnings),
      issues,
    };
  }

  return {
    status:
      issues.length > 0
        ? "blocked"
        : environmentVariables.length > 0 || policyWarnings.length > 0
          ? "setup_required"
          : "verified",
    requestsDetected,
    endpoints,
    environmentVariables,
    providers,
    policyWarnings: unique(policyWarnings),
    issues,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function validateSelectedApiUsage(
  files: SourceFile[],
  providerIds: string[],
): ApiIntegrationIssue[] {
  const selectedProviderIds = Array.from(new Set(providerIds));
  if (selectedProviderIds.length === 0) return [];

  const report = analyzeGeneratedApiIntegration(files);
  const integrationManifest = files.find((file) =>
    /(^|\/)integrations\.(?:ts|tsx|js|jsx)$/i.test(file.path),
  );
  const issues: ApiIntegrationIssue[] = [];

  for (const providerId of selectedProviderIds) {
    const provider = getIntegrationProvider(providerId);
    if (!provider) {
      issues.push({
        message: `Selected API ${providerId} is not present in Squid's reviewed integration registry.`,
      });
      continue;
    }

    if (provider.policyStatus === "blocked") {
      issues.push({
        message: `${provider.name} is selected but blocked by Squid's integration policy.`,
      });
      continue;
    }

    const providerIdPattern = new RegExp(
      `["']${escapeRegExp(provider.id)}["']`,
    );
    if (
      !integrationManifest ||
      !providerIdPattern.test(integrationManifest.code)
    ) {
      issues.push({
        path: integrationManifest?.path,
        message: `Selected API ${provider.name} [${provider.id}] must be declared in integrations.ts with its exact providerId.`,
      });
    }

    if (provider.id === "supabase") {
      const protectedClientImport = files.some((file) =>
        /\bimport\s*{[^}]*\bsupabase\b[^}]*}\s*from\s*["']@\/lib\/supabase["']/.test(
          file.code,
        ),
      );
      if (!protectedClientImport) {
        issues.push({
          message:
            'Selected API Supabase [supabase] must import its protected browser client from "@/lib/supabase".',
        });
      }
      continue;
    }

    if (provider.runtime !== "browser" || provider.auth !== "none") {
      continue;
    }

    const matchedProvider = report.providers.find(
      (candidate) => candidate.id === provider.id,
    );
    if (!matchedProvider || matchedProvider.matchedEndpoints.length === 0) {
      issues.push({
        message: `Selected API ${provider.name} [${provider.id}] must be called at runtime from its reviewed endpoint contract; mock or static data is not allowed.`,
      });
      continue;
    }

    const baseUrl = new URL(provider.baseUrl);
    for (const endpoint of matchedProvider.matchedEndpoints) {
      let endpointUrl: URL;
      try {
        endpointUrl = new URL(endpoint);
      } catch {
        continue;
      }

      const usesReviewedOrigin = endpointUrl.origin === baseUrl.origin;
      const usesReviewedBasePath =
        baseUrl.pathname === "/" ||
        endpointUrl.pathname === baseUrl.pathname ||
        endpointUrl.pathname.startsWith(
          `${baseUrl.pathname.replace(/\/$/, "")}/`,
        );
      if (usesReviewedOrigin && !usesReviewedBasePath) {
        issues.push({
          message: `${provider.name} endpoint ${endpoint} is outside the reviewed base URL ${provider.baseUrl}. Do not invent or use legacy API versions.`,
        });
      }
    }
  }

  return issues;
}

export async function validateAuthenticatedTasksGeneratedApp(
  files: SourceFile[],
): Promise<ApiIntegrationIssue[]> {
  const source = files
    .filter((file) => /\.(?:ts|tsx|js|jsx)$/i.test(file.path))
    .map((file) => file.code)
    .join("\n");
  const issues: ApiIntegrationIssue[] = [];
  const requiredPatterns: Array<[RegExp, string]> = [
    [
      /\bimport\s*{[^}]*\bsupabase\b[^}]*}\s*from\s*["']@\/lib\/supabase["']/,
      'Import the protected Supabase client from "@/lib/supabase".',
    ],
    [/\.auth\.signUp\s*\(/, "Implement email/password sign-up."],
    [/\.auth\.signInWithPassword\s*\(/, "Implement email/password login."],
    [/\.auth\.signOut\s*\(/, "Implement logout."],
    [/\.auth\.getSession\s*\(/, "Restore the initial auth session."],
    [
      /\.auth\.onAuthStateChange\s*\(/,
      "Subscribe to Supabase auth-state changes.",
    ],
    [
      /\.unsubscribe\s*\(/,
      "Unsubscribe the Supabase auth-state listener during cleanup.",
    ],
    [/\.from\(\s*["']tasks["']\s*\)[\s\S]*?\.select\s*\(/, "Load tasks."],
    [/\.from\(\s*["']tasks["']\s*\)[\s\S]*?\.insert\s*\(/, "Create tasks."],
    [/\.from\(\s*["']tasks["']\s*\)[\s\S]*?\.update\s*\(/, "Update tasks."],
    [/\.from\(\s*["']tasks["']\s*\)[\s\S]*?\.delete\s*\(/, "Delete tasks."],
    [
      /\buser_id\s*:\s*[A-Za-z_$][\w$]*(?:(?:\?\.|\.)[A-Za-z_$][\w$]*)*(?:\?\.|\.)id\b/,
      "Set task user_id from the authenticated session user.",
    ],
    [
      /\b(?:loading|isLoading|isSaving|savingTask|savingTitle|updatingTask|isUpdating)\b/i,
      "Show understandable loading feedback while saving a title edit.",
    ],
    [/\bloading\b/i, "Render loading state."],
    [/\berror\b/i, "Render actionable error state."],
  ];

  for (const [pattern, message] of requiredPatterns) {
    if (!pattern.test(source)) {
      issues.push({
        message: `Verified Supabase authenticated_tasks app is incomplete: ${message}`,
      });
    }
  }

  const tableMatches = source.matchAll(/\.from\(\s*["']([^"']+)["']\s*\)/g);
  for (const match of tableMatches) {
    if (match[1] !== "tasks") {
      issues.push({
        message:
          "Verified Supabase authenticated_tasks app may access only the public.tasks table.",
      });
      break;
    }
  }

  const ui = await analyzeAuthenticatedTasksUi(files);
  const requireUi = (condition: boolean, message: string) => {
    if (!condition) {
      issues.push({
        message: `Verified Supabase authenticated_tasks app is incomplete: ${message}`,
      });
    }
  };
  requireUi(
    ui.editControls.length > 0,
    "Render a reachable edit-title action that stays visible at rest; do not hide it behind opacity-0 or hover-only controls.",
  );
  requireUi(
    ui.titleInputs.length > 0,
    'Render a reachable controlled input with an accessible name containing "Task title".',
  );
  requireUi(
    ui.saveControls.length > 0,
    "Render a reachable Save action for title editing.",
  );
  requireUi(
    ui.cancelControls.length > 0,
    "Render a reachable Cancel action for title editing.",
  );
  requireUi(
    ui.titleUpdateFunctions.size > 0,
    "Save title edits with a Supabase tasks update containing title.",
  );
  requireUi(
    ui.titleUpdateIsFiltered,
    'Filter the Supabase title update by the task "id".',
  );
  requireUi(
    ui.titleUpdatePreservesCompletion,
    "Preserve completion state by updating only title metadata during title edits.",
  );
  requireUi(
    ui.saveReachesTitleUpdate,
    "Wire the rendered Save action to the Supabase title update.",
  );
  requireUi(
    ui.saveHasLoadingAndErrorFeedback,
    "Keep Save understandable while loading and render title-edit errors.",
  );
  requireUi(
    !ui.mutatesUserId,
    "Never include user_id in a task update payload; rely on RLS.",
  );
  requireUi(
    ui.logoutControls.length > 0,
    "Render logout with visible text or an accessible Log out label.",
  );
  requireUi(
    !ui.logoutControls.some((control) =>
      control.iconNames.some((name) => /(?:settings|cog)/i.test(name)),
    ),
    "Do not represent logout with a settings icon.",
  );
  requireUi(
    ui.inaccessibleIconButtons.length === 0,
    "Give every rendered icon-only button an accessible name.",
  );

  return issues;
}
