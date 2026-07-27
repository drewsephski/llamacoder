/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_MODEL } from "@/lib/constants";
import {
  clearPendingProject,
  readPendingProject,
  savePendingProject,
} from "@/lib/pending-project";

describe("pending project storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("persists and reads a pending project", () => {
    savePendingProject({
      prompt: "Build a task manager",
      model: DEFAULT_MODEL,
      quality: "low",
    });

    expect(readPendingProject()).toEqual({
      prompt: "Build a task manager",
      model: DEFAULT_MODEL,
      quality: "low",
    });
  });

  it("clears stored pending projects", () => {
    savePendingProject({
      prompt: "Build a task manager",
      model: DEFAULT_MODEL,
      quality: "low",
    });

    clearPendingProject();

    expect(readPendingProject()).toBeNull();
  });
});
