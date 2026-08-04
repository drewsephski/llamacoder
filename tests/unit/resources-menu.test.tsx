// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MobileResourcesList,
  ResourcesMenu,
} from "@/components/resources-menu";

describe("resources navigation", () => {
  it.each([
    ["desktop", <ResourcesMenu key="desktop" />],
    ["mobile", <MobileResourcesList key="mobile" />],
  ])("includes the usage ledger in the %s resources menu", (_, menu) => {
    render(menu);

    expect(screen.getByRole("link", { name: /^Usage ledger/ })).toHaveAttribute(
      "href",
      "/sign-in?callbackUrl=/dashboard/usage",
    );
  });
});
