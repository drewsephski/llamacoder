import { createProjectRequestSchema } from "@/features/projects/contracts";

const STORAGE_KEY = "squid:pending-project";

export type PendingProject = {
  prompt: string;
  model: string;
  quality: "high" | "low";
  providerIds?: string[];
  screenshotUrl?: string;
  screenshotData?: string;
  acquisition?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    referrer?: string;
    landingPath?: string;
  };
};

export function savePendingProject(project: PendingProject) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function readPendingProject(): PendingProject | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = createProjectRequestSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearPendingProject() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
