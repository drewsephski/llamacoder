// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiSelectionDialog } from "@/features/integrations/components/api-selection-dialog";

describe("API selection dialog", () => {
  it("lets a user select multiple reviewed APIs before creating an app", async () => {
    const onSelectionChange = vi.fn();
    render(
      <ApiSelectionDialog
        selectedProviderIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Choose APIs" }));
    const search = screen.getByRole("textbox", { name: "Search APIs" });

    await userEvent.type(search, "currency");
    await userEvent.click(screen.getByRole("button", { name: /Frankfurter/i }));
    await userEvent.clear(search);
    await userEvent.type(search, "weather service");
    await userEvent.click(
      screen.getByRole("button", { name: /National Weather Service/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Use 2 APIs" }));

    expect(onSelectionChange).toHaveBeenCalledWith([
      "frankfurter",
      "weather-gov",
    ]);
  });

  it("does not commit a draft selection when the modal is dismissed", async () => {
    const onSelectionChange = vi.fn();
    render(
      <ApiSelectionDialog
        selectedProviderIds={["hacker-news"]}
        onSelectionChange={onSelectionChange}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Choose APIs, 1 selected" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Remove Hacker News API" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
