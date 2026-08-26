import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@/test/navigation-mock";
import { useAuthMock } from "@/test/auth-context-mock";
import "@/test/auth-context-mock";
import { ApiError } from "@/lib/api-client";

import LoginPage from "./page";

describe("LoginPage", () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    loginMock.mockReset();
    useAuthMock.mockReturnValue({ login: loginMock, signup: vi.fn(), logout: vi.fn(), user: null, isLoading: false });
  });

  it("submits the entered email and password", async () => {
    loginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "roy@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct-horse");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("roy@example.com", "correct-horse"));
  });

  it("shows a safe error message when login fails", async () => {
    loginMock.mockRejectedValue(new ApiError("Invalid email or password", 401));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "roy@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
