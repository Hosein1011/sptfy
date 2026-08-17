import { render, screen } from "@testing-library/react";
import PrivacyPolicyModal from "../src/components/auth/PrivacyPolicyModal";

describe("PrivacyPolicyModal", () => {
    it("renders policy content when open", () => {
        render(<PrivacyPolicyModal isOpen={true} onClose={jest.fn()} />);
        expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /agree & accept/i })).toBeInTheDocument();
    });
});
