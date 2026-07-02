import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../src/app/(auth)/register/page";
import LoginPage from "../src/app/(auth)/login/page";
import { useRouter } from "next/navigation";

// شبیه‌سازی روتر Next.js
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("Authentication Flow Tests", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    describe("Register Component", () => {
        it("باید فرم ثبت‌نام را به درستی رندر کند", () => {
            render(<RegisterPage />);
            expect(screen.getByPlaceholderText(/email|ایمیل/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/password|رمز عبور/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /register|ثبت‌نام/i })).toBeInTheDocument();
        });

        it("باید از ثبت‌نام با ایمیل تکراری جلوگیری کرده و خطا نمایش دهد", async () => {
            const existingUsers = [{ email: "test@example.com", password: "password123" }];
            window.localStorage.setItem("users", JSON.stringify(existingUsers));

            render(<RegisterPage />);
            const emailInput = screen.getByPlaceholderText(/email|ایمیل/i);
            const passwordInput = screen.getByPlaceholderText(/password|رمز عبور/i);
            const submitButton = screen.getByRole("button", { name: /register|ثبت‌نام/i });

            await userEvent.type(emailInput, "test@example.com");
            await userEvent.type(passwordInput, "newpassword123");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/already exists|قبلا ثبت شده/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });

        it("باید کاربر جدید را در localStorage ذخیره کرده و هدایت کند", async () => {
            render(<RegisterPage />);
            const emailInput = screen.getByPlaceholderText(/email|ایمیل/i);
            const passwordInput = screen.getByPlaceholderText(/password|رمز عبور/i);
            const submitButton = screen.getByRole("button", { name: /register|ثبت‌نام/i });

            await userEvent.type(emailInput, "newuser@example.com");
            await userEvent.type(passwordInput, "securepassword");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith("/");
            });

            const storedUsers = JSON.parse(window.localStorage.getItem("users") || "[]");
            expect(storedUsers).toHaveLength(1);
            expect(storedUsers[0].email).toBe("newuser@example.com");
        });
    });

    describe("Login Component", () => {
        it("باید با اطلاعات معتبر لاگین کرده و کاربر را هدایت کند", async () => {
            const existingUsers = [{ email: "test@example.com", password: "password123" }];
            window.localStorage.setItem("users", JSON.stringify(existingUsers));

            render(<LoginPage />);
            const emailInput = screen.getByPlaceholderText(/email|ایمیل/i);
            const passwordInput = screen.getByPlaceholderText(/password|رمز عبور/i);
            const submitButton = screen.getByRole("button", { name: /login|ورود/i });

            await userEvent.type(emailInput, "test@example.com");
            await userEvent.type(passwordInput, "password123");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalled();
            });
        });

        it("باید در صورت اشتباه بودن اطلاعات، پیام خطا نمایش دهد", async () => {
            render(<LoginPage />);
            const emailInput = screen.getByPlaceholderText(/email|ایمیل/i);
            const passwordInput = screen.getByPlaceholderText(/password|رمز عبور/i);
            const submitButton = screen.getByRole("button", { name: /login|ورود/i });

            await userEvent.type(emailInput, "wrong@example.com");
            await userEvent.type(passwordInput, "wrongpassword");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/invalid|اشتباه/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });
    });
});
