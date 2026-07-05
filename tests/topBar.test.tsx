import { render, screen } from "@testing-library/react";
import TopBar from "../src/components/layout/TopBar";

describe("TopBar", () => {
    it("renders search input", () => {
        render(<TopBar />);
        expect(
            screen.getByPlaceholderText(/search for songs, artists, or albums/i)
        ).toBeInTheDocument();
    });

    it("renders auth controls", () => {
        render(<TopBar />);
        expect(screen.getByText(/toggle auth state/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });
});
