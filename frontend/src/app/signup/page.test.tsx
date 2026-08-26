import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@/test/navigation-mock";
import { useAuthMock } from "@/test/auth-context-mock";
import "@/test/auth-context-mock";
import { ApiError } from "@/lib/api-client";

import SignupPage from "./page";

describe("SignupPage", () => {
  const signupMock = vi.fn();

  beforeEach(() => {
    signupMock.mockReset();
    useAuthMock.mockReturnValue({ login: vi.fn(), signup: signupMock, logout: vi.fn(), user: null, isLoading: false });
  });

  it("submits the entered name, email, and password", async () => {
    signupMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/name/i), "Roy Meoded");
    await user.type(screen.getByLabelText(/email/i), "roy@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct-horse");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(signupMock).toHaveBeenCalledWith("Roy Meoded", "roy@example.com", "correct-horse"),
    );
  });

  it("shows a safe error message when signup fails", async () => {
    signupMock.mockRejectedValue(new ApiError("Email already registered", 409));
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText(/name/i), "Roy Meoded");
    await user.type(screen.getByLabelText(/email/i), "roy@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct-horse");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email already registered");
  });
});
