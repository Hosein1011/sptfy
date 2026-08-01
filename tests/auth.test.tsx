import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../src/app/(auth)/register/page";
import LoginPage from "../src/app/(auth)/login/page";
import { useRouter } from "next/navigation";

// Mocking useRouter
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mocking the modal component
jest.mock("../src/components/auth/PrivacyPolicyModal", () => ({
    __esModule: true,
    default: ({ isOpen, onClose }: any) => isOpen ? <div data-testid="privacy-modal">Modal</div> : null
}));

// Mock localStorage
const mockLocalStorage = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = String(value);
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        length: Object.keys(store).length
    };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe("Authentication Flow Tests", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        mockLocalStorage.clear();
        jest.clearAllMocks();
    });

    const registerButtonName = /create account/i;
    const loginButtonName = /log in/i;

    describe("Register Component", () => {
        it("فرم ثبت‌نام را درست رندر می‌کند", () => {
            render(<RegisterPage />);
            expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
            expect(screen.getByRole("checkbox")).toBeInTheDocument();
        });

        it("در صورت عدم تایید حریم خصوصی، خطا می‌دهد", async () => {
            render(<RegisterPage />);
            await userEvent.type(screen.getByPlaceholderText("John Doe"), "User");
            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "pass");

            fireEvent.click(screen.getByRole("button", { name: registerButtonName }));

            expect(screen.getByText(/لطفاً سیاست حفظ حریم خصوصی را بپذیرید/i)).toBeInTheDocument();
            expect(mockPush).not.toHaveBeenCalled();
        });

        it("کاربر جدید پس از تایید قوانین ذخیره می‌شود", async () => {
            render(<RegisterPage />);

            await userEvent.type(screen.getByPlaceholderText("John Doe"), "New User");
            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "password");

            await userEvent.click(screen.getByRole("checkbox"));

            fireEvent.click(screen.getByRole("button", { name: registerButtonName }));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith("/");
            });

            const users = JSON.parse(localStorage.getItem("sptfy_users") || "[]");
            // بررسی وجود کاربر بدون وابستگی به طول لیست
            const userExists = users.some((u: any) => u.email === "new@example.com");
            expect(userExists).toBe(true);
        });
    });

    describe("Login Component", () => {
        it("با اطلاعات صحیح لاگین می‌کند", async () => {
            const existing = [{ id: "u1", name: "AAA", email: "test@example.com", password: "1234", role: "USER" }];
            localStorage.setItem("sptfy_users", JSON.stringify(existing));

            render(<LoginPage />);
            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "1234");

            fireEvent.click(screen.getByRole("button", { name: loginButtonName }));

            await waitFor(() => expect(mockPush).toHaveBeenCalled());
        });
    });
});
