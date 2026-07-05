import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../src/app/(auth)/register/page";
import LoginPage from "../src/app/(auth)/login/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("Authentication Flow Tests", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        localStorage.clear();
        jest.clearAllMocks();
    });

    const registerButtonName = /create account/i;
    const loginButtonName = /log in/i;

    describe("Register Component", () => {
        it("فرم ثبت‌نام را درست رندر می‌کند", () => {
            render(<RegisterPage />);

            expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();

            expect(screen.getByRole("button", { name: registerButtonName })).toBeInTheDocument();
        });

        it("در صورت ایمیل تکراری، پیام خطا نمایش می‌دهد", async () => {
            const existing = [
                { id: "u1", name: "AAA", email: "test@example.com", password: "1234", role: "USER" }
            ];
            localStorage.setItem("sptfy_users", JSON.stringify(existing));

            render(<RegisterPage />);

            await userEvent.type(screen.getByPlaceholderText("John Doe"), "User");
            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "password");

            fireEvent.click(screen.getByRole("button", { name: registerButtonName }));

            await waitFor(() => {
                expect(screen.getByText("این ایمیل قبلاً ثبت شده است.")).toBeInTheDocument();
            });

            expect(mockPush).not.toHaveBeenCalled();
        });

        it("کاربر جدید ذخیره می‌شود و هدایت انجام می‌شود", async () => {
            render(<RegisterPage />);

            await userEvent.type(screen.getByPlaceholderText("John Doe"), "New User");
            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "password");

            fireEvent.click(screen.getByRole("button", { name: registerButtonName }));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith("/");
            });

            const users = JSON.parse(localStorage.getItem("sptfy_users") || "[]");
            expect(users.length).toBe(1);
            expect(users[0].email).toBe("new@example.com");
        });
    });

    describe("Login Component", () => {
        it("با اطلاعات صحیح لاگین می‌کند و هدایت درست انجام می‌شود", async () => {
            const existing = [
                { id: "u1", name: "AAA", email: "test@example.com", password: "1234", role: "USER" }
            ];
            localStorage.setItem("sptfy_users", JSON.stringify(existing));

            render(<LoginPage />);

            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "1234");

            fireEvent.click(screen.getByRole("button", { name: loginButtonName }));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalled();
            });
        });

        it("در صورت اطلاعات اشتباه پیام خطا نشان می‌دهد", async () => {
            render(<LoginPage />);

            await userEvent.type(screen.getByPlaceholderText("you@example.com"), "wrong@example.com");
            await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrong");

            fireEvent.click(screen.getByRole("button", { name: loginButtonName }));

            await waitFor(() => {
                expect(screen.getByText("ایمیل یا رمز عبور نامعتبر است.")).toBeInTheDocument();
            });

            expect(mockPush).not.toHaveBeenCalled();
        });
    });
});
