import { fetchJson } from "@/features/shared/client/http";
import {
  projectEligibilitySchema,
  type ProjectEligibility,
} from "@/features/user/contracts";

export function fetchProjectEligibility(
  model: string,
): Promise<ProjectEligibility> {
  return fetchJson(
    `/api/user/can-create-project?model=${encodeURIComponent(model)}`,
    projectEligibilitySchema,
  );
}
