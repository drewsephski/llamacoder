// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/server/actions", () => ({
  duplicateProject: vi.fn(),
}));
vi.mock("@/features/projects/components/delete-project-modal", () => ({
  DeleteProjectModal: () => null,
}));

import { ProjectCardActions } from "@/features/projects/components/project-card-actions";

describe("ProjectCardActions", () => {
  it("keeps project actions visible on touch layouts and reachable by keyboard", async () => {
    const user = userEvent.setup();
    render(
      <div className="group">
        <ProjectCardActions projectId="project_1" projectTitle="Portfolio" />
      </div>,
    );

    const duplicateButton = screen.getByRole("button", {
      name: "Duplicate Portfolio",
    });
    const deleteButton = screen.getByRole("button", {
      name: "Delete Portfolio",
    });
    const actionGroup = duplicateButton.parentElement;

    expect(actionGroup).toHaveClass("opacity-100");
    expect(actionGroup).toHaveClass("sm:group-focus-within:opacity-100");

    await user.tab();
    expect(duplicateButton).toHaveFocus();
    await user.tab();
    expect(deleteButton).toHaveFocus();
  });
});
