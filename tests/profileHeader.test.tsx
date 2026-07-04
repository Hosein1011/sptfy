import { render, screen } from "@testing-library/react";
import ProfileHeader from "../src/components/profile/ProfileHeader";

describe("ProfileHeader", () => {
    it("renders profile name", () => {
        render(<ProfileHeader name="Ali" />);
        expect(screen.getByText("Ali")).toBeInTheDocument();
    });

    it("renders profile subtitle", () => {
        render(<ProfileHeader name="Ali" subtitle="Premium user" />);
        expect(screen.getByText("Premium user")).toBeInTheDocument();
    });
});
