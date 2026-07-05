import { storage } from "../src/lib/storage";

describe("storage", () => {
    beforeEach(() => localStorage.clear());

    it("sets current user", () => {
        storage.setCurrentUser({ id: "u1", email: "a@b.com", name: "Ali" } as any);
        const user = storage.getCurrentUser();
        expect(user).not.toBeNull();
        expect(user?.id).toBe("u1");
    });

    it("logs out clears current user", () => {
        storage.setCurrentUser({ id: "u1" } as any);
        storage.logout();
        expect(storage.getCurrentUser()).toBeNull();
    });
});
