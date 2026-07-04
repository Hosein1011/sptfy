import { render, screen } from "@testing-library/react";
import NotificationBell from "../src/components/layout/NotificationBell";

describe("NotificationBell", () => {
    it("renders bell icon button", () => {
        render(<NotificationBell />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("shows unread state indicator", () => {
        render(<NotificationBell unreadCount={3} />);
        expect(screen.getByText("3")).toBeInTheDocument();
    });
});
