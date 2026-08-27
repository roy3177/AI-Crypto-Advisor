import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@/test/navigation-mock";
import { routerMock } from "@/test/navigation-mock";
import "@/test/auth-context-mock";
import { useAuthMock } from "@/test/auth-context-mock";
import "@/test/preferences-api-mock";
import { preferencesApiMock } from "@/test/preferences-api-mock";
import { ApiError } from "@/lib/api-client";

import OnboardingPage from "./page";

const OPTIONS = {
  assets: [
    { id: "bitcoin", label: "Bitcoin", symbol: "BTC" },
    { id: "ethereum", label: "Ethereum", symbol: "ETH" },
  ],
  investor_types: [
    { id: "hodler", label: "HODLer" },
    { id: "beginner", label: "Beginner" },
  ],
  content_types: [
    { id: "market_news", label: "Market News" },
    { id: "fun", label: "Fun Content" },
  ],
};

const authedUser = {
  id: "1",
  name: "Roy",
  email: "roy@example.com",
  onboarding_completed: false,
  created_at: "",
};

async function goThroughAllSteps(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /bitcoin/i }));
  await user.click(screen.getByRole("button", { name: /^next$/i }));

  await user.click(await screen.findByRole("button", { name: /hodler/i }));
  await user.click(screen.getByRole("button", { name: /^next$/i }));

  await user.click(await screen.findByRole("button", { name: /market news/i }));
}

describe("OnboardingPage", () => {
  const refreshUserMock = vi.fn();

  beforeEach(() => {
    routerMock.push.mockClear();
    routerMock.replace.mockClear();
    refreshUserMock.mockReset();
    preferencesApiMock.fetchPreferenceOptions.mockReset().mockResolvedValue(OPTIONS);
    preferencesApiMock.fetchMyPreferences.mockReset().mockRejectedValue(new ApiError("Not found", 404));
    preferencesApiMock.saveMyPreferences.mockReset();

    useAuthMock.mockReturnValue({
      user: authedUser,
      isLoading: false,
      logout: vi.fn(),
      refreshUser: refreshUserMock,
    });
  });

  it("shows the asset question first, populated from the options endpoint", async () => {
    render(<OnboardingPage />);
    expect(await screen.findByText(/what crypto assets/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bitcoin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ethereum/i })).toBeInTheDocument();
  });

  it("blocks advancing past step 1 with no asset selected", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);
    await user.click(await screen.findByRole("button", { name: /^next$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/select at least one crypto asset/i);
  });

  it("allows selecting multiple assets before advancing", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    const bitcoin = await screen.findByRole("button", { name: /bitcoin/i });
    const ethereum = screen.getByRole("button", { name: /ethereum/i });
    await user.click(bitcoin);
    await user.click(ethereum);

    expect(bitcoin).toHaveAttribute("aria-pressed", "true");
    expect(ethereum).toHaveAttribute("aria-pressed", "true");
  });

  it("submits the selected answers and navigates to the dashboard on success", async () => {
    preferencesApiMock.saveMyPreferences.mockResolvedValue({
      interested_assets: ["bitcoin"],
      investor_type: "hodler",
      content_types: ["market_news"],
      onboarding_completed: true,
      updated_at: "2026-01-01T00:00:00Z",
    });
    refreshUserMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<OnboardingPage />);
    await goThroughAllSteps(user);
    await user.click(screen.getByRole("button", { name: /finish/i }));

    await waitFor(() =>
      expect(preferencesApiMock.saveMyPreferences).toHaveBeenCalledWith({
        interested_assets: ["bitcoin"],
        investor_type: "hodler",
        content_types: ["market_news"],
      }),
    );
    // A brief celebration screen shows before the (cosmetic, timer-based)
    // redirect -- preferences are already saved by this point. `refreshUser`
    // and the actual navigation are deliberately deferred until after it.
    expect(await screen.findByText(/all set/i)).toBeInTheDocument();
    await waitFor(() => expect(refreshUserMock).toHaveBeenCalled(), { timeout: 3000 });
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/dashboard"), { timeout: 3000 });
  });

  it("acts as an edit screen for an already-onboarded user instead of redirecting away", async () => {
    useAuthMock.mockReturnValue({
      user: { ...authedUser, onboarding_completed: true },
      isLoading: false,
      logout: vi.fn(),
      refreshUser: refreshUserMock,
    });
    preferencesApiMock.fetchMyPreferences.mockReset().mockResolvedValue({
      interested_assets: ["bitcoin"],
      investor_type: "hodler",
      content_types: ["market_news"],
      onboarding_completed: true,
      updated_at: "2026-01-01T00:00:00Z",
    });

    render(<OnboardingPage />);

    expect(await screen.findByText(/update your preferences/i)).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
    // Existing answers are preloaded, and Bitcoin should show as selected.
    expect(await screen.findByRole("button", { name: /bitcoin/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an error and keeps selections when saving fails", async () => {
    preferencesApiMock.saveMyPreferences.mockRejectedValue(new ApiError("Could not save preferences", 500));

    const user = userEvent.setup();
    render(<OnboardingPage />);
    await goThroughAllSteps(user);
    await user.click(screen.getByRole("button", { name: /finish/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not save preferences/i);
    // Still on step 3 with the selection intact, not reset.
    expect(screen.getByRole("button", { name: /market news/i })).toHaveAttribute("aria-pressed", "true");
  });
});
