"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Globe2, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  compilePromptTemplate,
  createEmptyTemplateValues,
  getMissingRequiredTemplateFields,
  isPromptTemplateReady,
  parsePromptTemplateBody,
  type PromptTemplate,
  type PromptTemplateValues,
} from "@/lib/prompt-templates";

interface PromptTemplateEditorProps {
  template: PromptTemplate;
  values: PromptTemplateValues;
  onValuesChange: (values: PromptTemplateValues) => void;
  onCompiledPromptChange: (prompt: string) => void;
  onExitTemplate?: () => void;
  className?: string;
}

/** Trailing sentence punctuation that should sit flush against a field. */
const FLUSH_PUNCTUATION = /^([.,!?;:])(.*)$/s;

function getFieldCaption(label: string) {
  if (/linkedin/i.test(label)) return "LinkedIn";
  if (/portfolio url/i.test(label)) return "Portfolio URL";
  if (/product or company/i.test(label)) return "Product URL";
  if (/competitor/i.test(label)) return "Competitor";
  if (/api docs/i.test(label)) return "API docs";
  if (/api base/i.test(label)) return "API base";
  if (/website url/i.test(label)) return "Website";
  if (/listing/i.test(label)) return "Listing";
  if (/full name/i.test(label)) return "Name";
  if (/role or title/i.test(label)) return "Role";
  if (/visual direction/i.test(label)) return "Style";
  if (/company name/i.test(label)) return "Company";
  if (/product name/i.test(label)) return "Product";
  if (/target audience/i.test(label)) return "Audience";
  if (/primary cta/i.test(label)) return "CTA";
  if (/app name/i.test(label)) return "App";
  if (/data to display/i.test(label)) return "Data";
  if (/auth notes/i.test(label)) return "Auth";
  if (/business name/i.test(label)) return "Business";
  if (/business type/i.test(label)) return "Type";
  if (/^city$/i.test(label)) return "City";
  return label;
}

function InlineTemplateField({
  fieldId,
  label,
  placeholder,
  value,
  required,
  type = "text",
  trailingPunctuation,
  onChange,
}: {
  fieldId: string;
  label: string;
  placeholder: string;
  value: string;
  required?: boolean;
  type?: "text" | "url";
  trailingPunctuation?: string;
  onChange: (nextValue: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState<number | null>(null);
  const isUrlField = type === "url";
  const hasValue = Boolean(value.trim());
  const measureText = value.length > 0 ? value : placeholder;

  useLayoutEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;

    // Match the measure node's border-box width; +2px keeps the caret from clipping.
    const nextWidth = Math.ceil(measure.scrollWidth) + 2;
    setInputWidth((current) => (current === nextWidth ? current : nextWidth));
  }, [measureText, isUrlField]);

  return (
    <span
      className={cn(
        "template-field",
        isFocused && "is-focused",
        hasValue && "has-value",
        isUrlField && "is-url",
        trailingPunctuation && "has-trailing-punct",
      )}
    >
      <span
        ref={measureRef}
        className="template-field-measure"
        aria-hidden="true"
      >
        {measureText}
      </span>
      <input
        ref={inputRef}
        id={`template-field-${fieldId}`}
        type={isUrlField ? "url" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-label={label}
        required={required}
        spellCheck={isUrlField ? false : undefined}
        autoComplete="off"
        className="template-field-input"
        style={inputWidth != null ? { width: inputWidth } : undefined}
      />
      {trailingPunctuation ? (
        <span className="template-field-punct">{trailingPunctuation}</span>
      ) : null}
      <span
        className={cn(
          "template-field-caption",
          (isFocused || hasValue) && "is-visible",
        )}
        aria-hidden="true"
      >
        {getFieldCaption(label)}
      </span>
    </span>
  );
}

export function PromptTemplateEditor({
  template,
  values,
  onValuesChange,
  onCompiledPromptChange,
  onExitTemplate,
  className,
}: PromptTemplateEditorProps) {
  const headerId = useId();
  const segments = useMemo(
    () => parsePromptTemplateBody(template.body),
    [template.body],
  );
  const compiledPrompt = useMemo(
    () => compilePromptTemplate(template, values),
    [template, values],
  );
  const missingRequired = useMemo(
    () => getMissingRequiredTemplateFields(template, values),
    [template, values],
  );
  const isReady = isPromptTemplateReady(template, values);

  useEffect(() => {
    onCompiledPromptChange(compiledPrompt);
  }, [compiledPrompt, onCompiledPromptChange]);

  const handleFieldChange = useCallback(
    (fieldId: string, nextValue: string) => {
      onValuesChange({ ...values, [fieldId]: nextValue });
    },
    [onValuesChange, values],
  );

  const fieldMap = useMemo(
    () => new Map(template.fields.map((field) => [field.id, field])),
    [template.fields],
  );
  const firstFieldOccurrenceIndex = useMemo(() => {
    const indices = new Map<string, number>();
    segments.forEach((segment, index) => {
      if (segment.kind !== "field") return;
      if (!indices.has(segment.fieldId)) {
        indices.set(segment.fieldId, index);
      }
    });
    return indices;
  }, [segments]);

  return (
    <div
      className={cn("template-editor", className)}
      aria-labelledby={headerId}
    >
      <div className="template-editor-header">
        <div className="template-editor-heading">
          <div className="template-editor-icon" aria-hidden="true">
            <Sparkles className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p id={headerId} className="template-editor-title">
              {template.title}
            </p>
            <p className="template-editor-description">
              {template.description}
            </p>
          </div>
        </div>

        <div className="template-editor-actions">
          {template.enablesWebResearch && (
            <span className="template-research-badge">
              <Globe2 className="size-3" aria-hidden="true" />
              Web research
            </span>
          )}
          {onExitTemplate && (
            <button
              type="button"
              onClick={onExitTemplate}
              className="template-exit-btn"
              aria-label="Switch to freeform prompt"
            >
              <X className="size-3.5" />
              Freeform
            </button>
          )}
        </div>
      </div>

      <div
        className="template-editor-body"
        role="group"
        aria-label={`${template.title} prompt template`}
      >
        {segments.map((segment, index) => {
          if (segment.kind === "text") {
            // Leading punctuation after a field is rendered flush on the field.
            const previous = segments[index - 1];
            const punctMatch =
              previous?.kind === "field"
                ? segment.value.match(FLUSH_PUNCTUATION)
                : null;
            const textValue = punctMatch
              ? (punctMatch[2] ?? "")
              : segment.value;
            if (!textValue) return null;

            return (
              <span key={`text-${index}`} className="template-editor-text">
                {textValue}
              </span>
            );
          }

          const field = fieldMap.get(segment.fieldId);
          if (!field) return null;

          const nextSegment = segments[index + 1];
          const trailingPunctuation =
            nextSegment?.kind === "text"
              ? (nextSegment.value.match(FLUSH_PUNCTUATION)?.[1] ?? undefined)
              : undefined;

          const isPrimaryField =
            firstFieldOccurrenceIndex.get(segment.fieldId) === index;

          if (!isPrimaryField) {
            const mirroredValue = values[field.id]?.trim() || field.placeholder;
            return (
              <span
                key={`mirror-${segment.fieldId}-${index}`}
                className={cn(
                  "template-field-mirror",
                  trailingPunctuation && "has-trailing-punct",
                )}
                aria-label={field.label}
              >
                {mirroredValue}
                {trailingPunctuation ? (
                  <span className="template-field-punct">
                    {trailingPunctuation}
                  </span>
                ) : null}
              </span>
            );
          }

          return (
            <InlineTemplateField
              key={`field-${segment.fieldId}-${index}`}
              fieldId={field.id}
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.id] ?? ""}
              required={field.required}
              type={field.type}
              trailingPunctuation={trailingPunctuation}
              onChange={(nextValue) => handleFieldChange(field.id, nextValue)}
            />
          );
        })}
      </div>

      <div className="template-editor-footer">
        <div className="template-field-hints">
          {template.fields
            .filter((field) => field.hint)
            .slice(0, 2)
            .map((field) => (
              <span key={field.id} className="template-field-hint">
                <strong>{field.label}:</strong> {field.hint}
              </span>
            ))}
        </div>
        <p
          className={cn("template-status", isReady ? "is-ready" : "is-pending")}
          aria-live="polite"
        >
          {isReady
            ? "Ready to build with live research"
            : `Fill in ${missingRequired.map((field) => field.label.toLowerCase()).join(" and ")}`}
        </p>
      </div>
    </div>
  );
}

export function createInitialTemplateValues(template: PromptTemplate) {
  return createEmptyTemplateValues(template);
}
