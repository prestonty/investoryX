"use client";
// Show both sign in and login using if statements
import GoogleButton from "react-google-button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/animations.css";

// import { google } from "@/lib/googleClient";
import { useState, useEffect } from "react";
import { registerUser, type RegisterData } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Basic validation
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            const userData: RegisterData = {
                Name: name.trim(),
                email: email.trim(),
                password: password,
            };

            const user = await registerUser(userData);

            // Show success toast with email verification info
            toast.success(
                "Account created successfully! Please check your email to verify your account.",
            );
            setSuccess(
                "Registration successful! Please check your email to verify your account.",
            );

            // Redirect to login page after successful registration
            setTimeout(() => {
                router.push("/login");
            }, 3000); // Give user more time to read the message
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Registration failed";

            // Show specific error messages
            if (errorMessage.includes("Email already registered")) {
                toast.error(
                    "An account with this email already exists. Please login instead.",
                );
            } else if (errorMessage.includes("email")) {
                toast.error("Please enter a valid email address.");
            } else {
                toast.error("Registration failed. Please try again.");
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='font-[family-name:var(--font-geist-sans)]'>
            <Toaster
                position='top-center'
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: "green",
                            secondary: "white",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "red",
                            secondary: "white",
                        },
                    },
                }}
            />
            <div className='relative bg-light h-screen flex items-center justify-center'>
                {/* Triangle Animations */}
                <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                    {/* TODO - Add a character that appears when user enters their name!! */}

                    {/* Blue triangles */}
                    {password !== "" && (
                        <>
                            <div
                                className='login-top-blue-tri absolute -top-12 -right-20 h-[16vmax]
                    w-[60vmax] origin-top-right
                    bg-blue rotate-[14deg] blue-triangle'
                            ></div>

                            <div
                                className='login-bot-blue-tri absolute -bottom-12 -left-20 h-[16vmax]
                    w-[60vmax] origin-bottom-left
                    bg-blue rotate-[14deg] blue-triangle'
                            ></div>
                        </>
                    )}

                    {/* Black triangles */}
                    {email !== "" && (
                        <>
                            <div
                                className='login-bot-black-tri absolute -bottom-10 right-56 h-[86vmax]
                    w-[50vmax] origin-bottom-left
                    bg-dark rotate-[76deg] black-triangle'
                            ></div>

                            <div
                                className='login-top-black-tri absolute -top-10 left-56 h-[86vmax]
                    w-[50vmax] origin-top-right
                    bg-dark rotate-[76deg] black-triangle'
                            ></div>
                        </>
                    )}
                </div>

                <div className='w-3/4 xl:w-1/2 mx-auto flex flex-col justify-center z-5'>
                    <h1 className='text-dark text-6xl font-extrabold text-center'>
                        Sign Up
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

                    <hr className='h-[2px] mt-16 bg-livid' />

                    {/* Error/Success Messages */}
                    {error && (
                        <div className='w-full max-w-md mx-auto mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className='w-full max-w-md mx-auto mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
                            {success}
                        </div>
                    )}

                    {/* Login Form */}
                    <div className='flex flex-col items-center gap-x-4 mt-10'>
                        <form
                            onSubmit={handleSubmit}
                            className='w-full text-dark flex flex-col items-center gap-y-4'
                        >
                            <div className='flex flex-col text-dark'>
                                <label
                                    className={`text-lg pl-4 ${
                                        isNameFocused ? "text-blue" : ""
                                    } transition-colors duration-500`}
                                >
                                    Name
                                </label>
                                <input
                                    className='w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500'
                                    type='text'
                                    id='name'
                                    name='name'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => {
                                        setIsNameFocused(true);
                                    }}
                                    onBlur={() => {
                                        setIsNameFocused(false);
                                    }}
                                />
                            </div>
                            <div className='flex flex-col text-dark'>
                                <label
                                    className={`text-lg pl-4 ${
                                        isEmailFocused ? "text-blue" : ""
                                    } transition-colors duration-500`}
                                >
                                    Email
                                </label>
                                <input
                                    className='w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500'
                                    type='text'
                                    id='email'
                                    name='email'
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
                            <div className='flex flex-col'>
                                <label
                                    className={`text-lg pl-4 ${
                                        isPasswordFocused ? "text-blue" : ""
                                    } transition-colors duration-500`}
                                >
                                    Password
                                </label>

                                <input
                                    className='w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500'
                                    type='password'
                                    id='password'
                                    name='password'
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
                                type='submit'
                                disabled={loading}
                                className={`w-40 px-4 py-2 mt-8 rounded-[30px] text-lg transition-colors duration-500 ${
                                    loading
                                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                        : "bg-dark text-white hover:text-light hover:bg-blue cursor-pointer"
                                }`}
                                value={loading ? "Creating..." : "Continue"}
                            />
                        </form>
                        <div className='flex justify-center items-center gap-2 text-xl mt-8'>
                            <p className='text-dark m-0'>
                                Already have an account?
                            </p>
                            <Link
                                className='text-blue text-center font-normal hover:font-medium hover:text-darkblue transition-all duration-500'
                                href='/login'
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
