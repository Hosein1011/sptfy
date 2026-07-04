import { render, screen } from "@testing-library/react";
import TopBar from "../src/components/layout/TopBar";

describe("TopBar", () => {
    it("renders app branding", () => {
        render(<TopBar />);
        expect(screen.getByText(/sptfy/i)).toBeInTheDocument();
    });

    it("renders a notification control", () => {
        render(<TopBar />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
});
