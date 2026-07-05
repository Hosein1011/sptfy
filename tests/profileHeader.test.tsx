import { render, screen } from "@testing-library/react";
import ProfileHeader from "../src/components/profile/ProfileHeader";

describe("ProfileHeader", () => {
    it("renders the user name", () => {
        render(<ProfileHeader name="Ali" subtitle="Premium user" />);
        expect(screen.getByText("Ali")).toBeInTheDocument();
    });

    it("renders the default subtitle", () => {
        render(<ProfileHeader name="Ali" subtitle="Premium user" />);
        expect(screen.getByText("کاربر عادی")).toBeInTheDocument();
    });

    it("renders the plan badge", () => {
        render(<ProfileHeader name="Ali" subtitle="Premium user" />);
        expect(screen.getByText("رایگان")).toBeInTheDocument();
    });
});
