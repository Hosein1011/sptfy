import { render, screen } from "@testing-library/react";
import PrivacyPolicyModal from "../src/components/auth/PrivacyPolicyModal";

describe("PrivacyPolicyModal", () => {
    it("does not render when closed", () => {
        render(<PrivacyPolicyModal isOpen={false} onClose={jest.fn()} />);
        expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
    });

    it("renders policy content when open", () => {
        render(<PrivacyPolicyModal isOpen={true} onClose={jest.fn()} />);
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    });
});
