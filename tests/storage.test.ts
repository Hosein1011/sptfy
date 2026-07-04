import { saveToStorage, getFromStorage } from "../src/lib/storage";

describe("storage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("saves values correctly", () => {
        saveToStorage("theme", "dark");
        expect(localStorage.getItem("theme")).toBe(JSON.stringify("dark"));
    });

    it("reads values correctly", () => {
        localStorage.setItem("theme", JSON.stringify("light"));
        expect(getFromStorage("theme")).toBe("light");
    });
});
