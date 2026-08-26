import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { routerMock } from "@/test/navigation-mock";
import "@/test/navigation-mock";
import { useAuthMock } from "@/test/auth-context-mock";
import "@/test/auth-context-mock";

import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    routerMock.replace.mockClear();
  });

  it("shows a loading state while the initial auth check is in progress", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: true });
    render(<ProtectedRoute>Secret content</ProtectedRoute>);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no authenticated user", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });
    render(<ProtectedRoute>Secret content</ProtectedRoute>);

    expect(routerMock.replace).toHaveBeenCalledWith("/login");
  });

  it("renders children once a user is authenticated", () => {
    useAuthMock.mockReturnValue({
      user: { id: "1", name: "Roy", email: "roy@example.com", onboarding_completed: true, created_at: "" },
      isLoading: false,
    });
    render(<ProtectedRoute>Secret content</ProtectedRoute>);

    expect(screen.getByText("Secret content")).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
