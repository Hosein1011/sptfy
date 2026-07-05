import { render, screen } from "@testing-library/react";
import PrivacyPolicyModal from "../src/components/auth/PrivacyPolicyModal";

describe("PrivacyPolicyModal", () => {
    it("renders policy content when open", () => {
        render(<PrivacyPolicyModal isOpen={true} onClose={jest.fn()} />);
        expect(screen.getByText("سیاست حفظ حریم خصوصی")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /تایید و پذیرش/i })).toBeInTheDocument();
    });
});
