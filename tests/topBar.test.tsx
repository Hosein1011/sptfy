import { render, screen } from "@testing-library/react";
import TopBar from "../src/components/layout/TopBar";
import { useAuthStore } from "../src/store/authStore";

jest.mock("../src/store/authStore");

describe("TopBar", () => {
    it("renders auth controls when logged out", () => {
        (useAuthStore as jest.Mock).mockReturnValue({ isAuthenticated: false });
        render(<TopBar />);
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });
});
