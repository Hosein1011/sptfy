import { render } from "@testing-library/react";
import NotificationBell from "../src/components/layout/NotificationBell";

describe("NotificationBell", () => {
    it("shows unread badge when unreadCount > 0", () => {
        const { container } = render(<NotificationBell unreadCount={3} />);
        expect(container.querySelector("span.bg-melora-pink")).toBeInTheDocument();
    });

    it("hides unread badge when unreadCount is 0", () => {
        const { container } = render(<NotificationBell unreadCount={0} />);
        expect(container.querySelector("span.bg-melora-pink")).toBeNull();
    });
});
