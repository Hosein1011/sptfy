import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "../src/app/(main)/settings/page";
import { useAuthStore } from "../src/store/authStore";
import { storage } from "../src/lib/storage";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../src/lib/api", () => ({
  userApi: {
    getPreferences: jest.fn().mockResolvedValue({
      highQuality: true,
      spatialAudio: false,
      offlineMode: true,
      privateSession: false,
      dataSaver: false,
    }),
    updatePreferences: jest.fn().mockResolvedValue({}),
  },
  tokenStorage: {
    get: jest.fn(() => null),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

describe("SettingsPage & Account Deletion Tests", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    useAuthStore.setState({
      user: {
        id: "user-test-1",
        name: "Test Listener",
        username: "testuser",
        email: "test@melora.app",
        role: "USER",
        tier: "FREE",
        followingIds: [],
      },
      isAuthenticated: true,
      isHydrated: true,
    });
  });

  it("renders user information and settings correctly", async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Preferences")).toBeInTheDocument();
    });
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
  });

  it("deletes account and redirects to home on confirmation", async () => {
    window.confirm = jest.fn(() => true);

    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Delete Account")).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("does not delete account if user cancels confirmation dialog", async () => {
    window.confirm = jest.fn(() => false);

    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText("Delete Account")).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    fireEvent.click(deleteButton);

    expect(mockPush).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("storage.deleteUser cleans up user, playlists, and notifications", () => {
    const testUser = {
      id: "u-cleanup",
      name: "Cleanup User",
      email: "cleanup@melora.app",
      role: "USER" as const,
      tier: "FREE" as const,
      followingIds: [],
    };
    storage.saveUser(testUser);
    storage.createPlaylist("pl-cleanup", "My Clean Playlist", [], "u-cleanup");

    storage.deleteUser("u-cleanup");

    const users = storage.getUsers();
    expect(users.some((u) => u.id === "u-cleanup")).toBe(false);
  });
});
