// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

describe("Tooltip", () => {
  it("portals content outside overflow-hidden containers", () => {
    render(
      <div className="overflow-hidden">
        <TooltipProvider delayDuration={0}>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <button type="button">Credit details</button>
            </TooltipTrigger>
            <TooltipContent>Available credit details</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>,
    );

    const popper = document.querySelector(
      "[data-radix-popper-content-wrapper]",
    );

    expect(popper).not.toBeNull();
    expect(popper).toHaveTextContent("Available credit details");
    expect(popper?.parentElement).toBe(document.body);
  });
});
