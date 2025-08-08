"use client";
// Show both sign in and login using if statements
import GoogleButton from "react-google-button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./login.css";
import "@/styles/animations.css";

// import { google } from "@/lib/googleClient";
import { useState, useEffect } from "react";
import { loginUser, type LoginData } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic validation
        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            setLoading(false);
            return;
        }

        try {
            const loginData: LoginData = {
                username: email.trim(), // FastAPI expects 'username' field for email
                password: password,
            };

            const authResponse = await loginUser(loginData);

            // Store the token in localStorage (in production, consider more secure storage)
            localStorage.setItem("access_token", authResponse.access_token);

            // Show success message
            toast.success("Login successful! Redirecting...");

            // Small delay for user to see the success message
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Login failed";

            // Show specific error messages based on the error
            if (errorMessage.includes("Incorrect email or password")) {
                toast.error("Incorrect email or password");
            } else if (
                errorMessage.includes("User not found") ||
                errorMessage.includes("email")
            ) {
                toast.error("No account with this email");
            } else if (errorMessage.includes("password")) {
                toast.error("Incorrect password");
            } else {
                toast.error("Login failed");
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="relative bg-light h-screen flex items-center justify-center">
                {/* Triangle Animations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Blue triangles */}
                    {password !== "" && (
                        <>
                            <div
                                className="login-top-blue-tri absolute -top-12 -right-20 h-[16vmax]
                    w-[60vmax] origin-top-right
                    bg-blue rotate-[14deg] blue-triangle"
                            ></div>

                            <div
                                className="login-bot-blue-tri absolute -bottom-12 -left-20 h-[16vmax]
                    w-[60vmax] origin-bottom-left
                    bg-blue rotate-[14deg] blue-triangle"
                            ></div>
                        </>
                    )}

                    {/* Black triangles */}
                    {email !== "" && (
                        <>
                            <div
                                className="login-bot-black-tri absolute -bottom-10 right-56 h-[86vmax]
                    w-[50vmax] origin-bottom-left
                    bg-dark rotate-[76deg] black-triangle"
                            ></div>

                            <div
                                className="login-top-black-tri absolute -top-10 left-56 h-[86vmax]
                    w-[50vmax] origin-top-right
                    bg-dark rotate-[76deg] black-triangle"
                            ></div>
                        </>
                    )}
                </div>

                {/* Toast */}
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    containerClassName=""
                    containerStyle={{}}
                    toastOptions={{
                        // Define default options
                        className: "",
                        duration: 5000,
                        removeDelay: 1000,
                        style: {
                            background: "#fff",
                            color: "#181D2A",
                        },

                        // Default options for specific types
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: "green",
                                secondary: "white",
                            },
                        },
                        error: {
                            duration: 3000,
                            iconTheme: {
                                primary: "red",
                                secondary: "white",
                            },
                        },
                    }}
                />

                <div className="w-3/4 xl:w-1/2 mx-auto flex flex-col justify-center z-5">
                    <h1 className="text-dark text-6xl font-extrabold text-center">
                        Login
                    </h1>

                    {/* Google Button (adding nested tags may affect css styling in login.css) */}
                    {/* <div className="google-container flex justify-center mt-[8%] mr-[2rem]">
                    <GoogleButton
                        onClick={() => {
                            google.signIn();
                        }}
                    />
                    <p className="relative top-[28%] ml-[-11rem] text-dark">
                        Sign in With Google
                    </p>
                </div> */}

                    <hr className="h-[2px] mt-16 bg-livid" />

                    {/* Error Message */}
                    {error && (
                        <div className="w-full max-w-md mx-auto mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <div className="flex flex-col items-center gap-x-4 mt-10">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full text-dark flex flex-col items-center gap-y-4"
                        >
                            <div className="flex flex-col text-dark">
                                <label
                                    className={`text-lg pl-4 ${
                                        isEmailFocused ? "text-blue" : ""
                                    } transition-colors duration-500`}
                                >
                                    Email
                                </label>
                                <input
                                    className="w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500"
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => {
                                        setIsEmailFocused(true);
                                    }}
                                    onBlur={() => {
                                        setIsEmailFocused(false);
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label
                                    className={`text-lg pl-4 ${
                                        isPasswordFocused ? "text-blue" : ""
                                    } transition-colors duration-500`}
                                >
                                    Password
                                </label>

                                <input
                                    className="w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500"
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onFocus={() => {
                                        setIsPasswordFocused(true);
                                    }}
                                    onBlur={() => {
                                        setIsPasswordFocused(false);
                                    }}
                                />
                            </div>

                            <input
                                type="submit"
                                disabled={loading}
                                className={`w-40 px-4 py-2 mt-8 rounded-[30px] text-lg transition-colors duration-500 ${
                                    loading
                                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                        : "bg-dark text-white hover:text-light hover:bg-blue cursor-pointer"
                                }`}
                                value={loading ? "Logging in..." : "Login"}
                            />
                        </form>
                        <div className="flex justify-center items-center gap-2 text-xl mt-8">
                            <p className="text-dark m-0">
                                Don't have an account?
                            </p>
                            <Link
                                className="text-blue text-center hover:text-darkblue transition-colors duration-500"
                                href="/sign-up"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
