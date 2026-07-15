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

  it("lists UFC API for MMA and fighter ranking apps", async () => {
    const onSelectionChange = vi.fn();
    render(
      <ApiSelectionDialog
        selectedProviderIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Choose APIs" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Search APIs" }),
      "MMA rankings",
    );
    await userEvent.click(screen.getByRole("button", { name: /UFC API/i }));
    await userEvent.click(screen.getByRole("button", { name: "Use 1 API" }));

    expect(onSelectionChange).toHaveBeenCalledWith(["octagon"]);
  });

  it("lists every newly reviewed public API in catalog search", async () => {
    render(
      <ApiSelectionDialog
        selectedProviderIds={[]}
        onSelectionChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Choose APIs" }));
    const search = screen.getByRole("textbox", { name: "Search APIs" });
    const providerNames = [
      "Art Institute of Chicago",
      "USGS Earthquakes",
      "The Met Collection",
      "OpenFEMA",
      "Federal Register",
      "World Bank Indicators",
      "Open Library",
      "Open Food Facts",
      "GBIF",
      "openFDA",
    ];

    for (const providerName of providerNames) {
      await userEvent.clear(search);
      await userEvent.type(search, providerName);
      expect(
        screen.getByRole("button", { name: new RegExp(providerName, "i") }),
      ).toBeInTheDocument();
    }
  });
});
