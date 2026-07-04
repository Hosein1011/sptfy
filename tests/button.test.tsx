import { render, screen } from "@testing-library/react";
import Button from "../src/components/common/Button";

describe("Button", () => {
    it("renders label text", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("can be disabled", () => {
        render(<Button disabled>Save</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });
});
