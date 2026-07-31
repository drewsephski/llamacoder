// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createUserMessageMock,
  fetchCompletionStreamMock,
  onNewStreamPromiseMock,
  refreshMock,
} = vi.hoisted(() => ({
  createUserMessageMock: vi.fn(),
  fetchCompletionStreamMock: vi.fn(),
  onNewStreamPromiseMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: refreshMock }),
}));
vi.mock("@/features/generation/client/messages", () => ({
  createUserMessage: createUserMessageMock,
}));
vi.mock("@/features/generation/client/completion-stream", () => ({
  fetchCompletionStream: fetchCompletionStreamMock,
}));
vi.mock("@/features/user/client/queries", () => ({
  useUserCredits: () => ({
    data: { credits: 10, hasActiveSubscription: true },
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({ data: { user: { id: "user_1" } } }),
}));
vi.mock("@/features/billing/components/pricing-modal", () => ({
  PricingModal: () => null,
}));
vi.mock("@/features/billing/components/credits-load-error", () => ({
  CreditsLoadError: () => null,
}));
vi.mock("@/features/billing/components/upgrade-banner", () => ({
  UpgradeBanner: () => null,
}));
vi.mock(
  "@/features/integrations/components/project-integrations-panel",
  () => ({
    ProjectIntegrationsPanel: () => null,
  }),
);
vi.mock("@/components/generation-loader", () => ({
  GenerationLoader: () => null,
}));

import ChatBox from "@/app/(main)/chats/[id]/chat-box";

describe("ChatBox image paste", () => {
  beforeEach(() => {
    createUserMessageMock.mockResolvedValue({ messageId: "message_1" });
    fetchCompletionStreamMock.mockReturnValue(Promise.resolve({}));
  });

  it("sends a pasted image through multimodal generation without requiring text", async () => {
    render(
      <ChatBox
        chat={{ id: "chat_1", title: "Test", model: "model_1", messages: [] }}
        onNewStreamPromiseAction={onNewStreamPromiseMock}
        isStreaming={false}
        onStopAction={vi.fn()}
      />,
    );

    const image = new File(["png"], "pasted.png", { type: "image/png" });
    fireEvent.paste(screen.getByLabelText("Message Squid Agent"), {
      clipboardData: {
        items: [
          {
            kind: "file",
            type: "image/png",
            getAsFile: () => image,
          },
        ],
        files: [image],
      },
    });

    expect(
      await screen.findByAltText("Screenshot attached for cloning"),
    ).toBeInTheDocument();
    const sendButton = screen.getByRole("button", { name: "Send message" });
    expect(sendButton).toBeEnabled();

    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(createUserMessageMock).toHaveBeenCalledWith(
        "chat_1",
        "Recreate the attached image as closely as possible in code.",
      );
    });
    expect(fetchCompletionStreamMock).toHaveBeenCalledWith({
      messageId: "message_1",
      model: "model_1",
      screenshotData: "data:image/png;base64,cG5n",
    });
    expect(onNewStreamPromiseMock).toHaveBeenCalledTimes(1);
  });
});
