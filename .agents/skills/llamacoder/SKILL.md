```markdown
# llamacoder Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `llamacoder` TypeScript codebase. You'll learn about file naming, import/export styles, commit message conventions, and how to write and run tests using Vitest. This guide also provides suggested commands for common workflows to streamline your development process.

## Coding Conventions

### File Naming
- **Style:** kebab-case
- **Example:**  
  ```
  llama-utils.ts
  code-formatter.test.ts
  ```

### Import Style
- **Style:** Alias imports are preferred.
- **Example:**
  ```typescript
  import { parseCode } from '@utils/parser';
  ```

### Export Style
- **Style:** Mixed (both named and default exports are used).
- **Example:**
  ```typescript
  // Named export
  export function formatCode(input: string): string { ... }

  // Default export
  export default LlamaCoder;
  ```

### Commit Message Conventions
- **Type:** Conventional Commits
- **Prefix:** `feat`
- **Average Length:** 51 characters
- **Example:**
  ```
  feat: add support for new code formatting options
  ```

## Workflows

### Feature Development
**Trigger:** When implementing a new feature  
**Command:** `/feature-dev`

1. Create a new branch for your feature.
2. Implement the feature following coding conventions.
3. Write or update tests in a corresponding `.test.ts` file.
4. Commit changes using the `feat:` prefix and a descriptive message.
5. Push your branch and open a pull request.

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Ensure all test files are named with the `.test.ts` suffix.
2. Run tests using Vitest:
   ```
   npx vitest run
   ```
3. Review test output and fix any failing tests.

## Testing Patterns

- **Framework:** Vitest
- **Test File Pattern:** `*.test.ts`
- **Example Test File:**
  ```typescript
  import { formatCode } from './code-formatter';

  test('formats code correctly', () => {
    expect(formatCode('let x=1;')).toBe('let x = 1;');
  });
  ```

- **Test Command:**
  ```
  npx vitest run
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /feature-dev   | Start a new feature development workflow      |
| /run-tests     | Run all Vitest tests in the codebase         |
```
