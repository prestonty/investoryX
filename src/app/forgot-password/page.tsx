"use client";

import Link from "next/link";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPassword() {
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [sentMessage, setSentMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            const result = await requestPasswordReset(email.trim());
            setSentMessage(result.message);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not send reset email",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster
                position='top-center'
                toastOptions={{
                    duration: 4000,
                    style: { background: "#363636", color: "#fff" },
                }}
            />
            <div className='relative bg-light h-screen flex items-center justify-center font-[family-name:var(--font-geist-sans)]'>
                <div className='w-3/4 xl:w-1/2 mx-auto flex flex-col justify-center z-5'>
                    <h1 className='text-dark text-6xl font-extrabold text-center'>
                        Forgot Password
                    </h1>

                    <hr className='h-[2px] mt-16 bg-livid' />

                    <div className='flex flex-col items-center mt-10'>
                        {sentMessage ? (
                            <div className='w-80 text-center text-dark'>
                                <p className='text-lg font-semibold'>
                                    Check your email
                                </p>
                                <p className='mt-2'>{sentMessage}</p>
                                <p className='mt-2 text-sm text-gray'>
                                    The link expires in 30 minutes. Not seeing
                                    it? Check your spam folder.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className='w-full text-dark flex flex-col items-center gap-y-4'
                            >
                                <p className='w-72 text-center'>
                                    {"Enter the email for your account and we'll send you a link to reset your password."}
                                </p>
                                <div className='flex flex-col'>
                                    <label
                                        className={`text-lg pl-4 ${
                                            isEmailFocused ? "text-blue" : ""
                                        } transition-colors duration-500`}
                                    >
                                        Email
                                    </label>
                                    <input
                                        className='w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500'
                                        type='email'
                                        id='email'
                                        name='email'
                                        autoComplete='email'
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        onFocus={() => setIsEmailFocused(true)}
                                        onBlur={() => setIsEmailFocused(false)}
                                    />
                                </div>

                                <input
                                    type='submit'
                                    disabled={loading || !email.trim()}
                                    className={`w-48 px-4 py-2 mt-8 rounded-[30px] text-lg transition-colors duration-500 ${
                                        loading || !email.trim()
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-dark text-white hover:text-light hover:bg-blue cursor-pointer"
                                    }`}
                                    value={
                                        loading ? "Sending..." : "Send reset link"
                                    }
                                />
                            </form>
                        )}

                        <div className='flex justify-center items-center gap-2 text-xl mt-8'>
                            <p className='text-dark m-0'>
                                Remembered it?
                            </p>
                            <Link
                                className='text-blue text-center font-normal hover:font-medium hover:text-darkblue transition-all duration-500'
                                href='/login'
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
