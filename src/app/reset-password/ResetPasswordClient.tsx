"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { resetPassword } from "@/lib/api";
import { PASSWORD_RULE_TEXT, passwordPolicyError } from "@/lib/passwordPolicy";

const inputClass =
    "w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500";

export default function ResetPasswordClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [focused, setFocused] = useState<"password" | "confirm" | null>(
        null,
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);

    const mismatch = confirmPassword !== "" && password !== confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        const policyError = passwordPolicyError(password);
        if (policyError) {
            toast.error(policyError);
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
            toast.success("Password reset! Redirecting to login...");
            setTimeout(() => router.push("/login"), 2500);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Password reset failed",
            );
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = !loading && !done && password !== "" && !mismatch &&
        confirmPassword !== "";

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
                        Reset Password
                    </h1>

                    <hr className='h-[2px] mt-16 bg-livid' />

                    <div className='flex flex-col items-center mt-10 text-dark'>
                        {!token ? (
                            <div className='w-80 text-center'>
                                <p className='text-red font-semibold'>
                                    This reset link is missing its token.
                                </p>
                                <p className='mt-2'>
                                    Please use the link from your email, or
                                    request a new one.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className='w-full flex flex-col items-center gap-y-4'
                            >
                                <div className='flex flex-col'>
                                    <label
                                        className={`text-lg pl-4 ${
                                            focused === "password"
                                                ? "text-blue"
                                                : ""
                                        } transition-colors duration-500`}
                                    >
                                        New password
                                    </label>
                                    <input
                                        className={inputClass}
                                        type='password'
                                        id='password'
                                        name='password'
                                        autoComplete='new-password'
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        onFocus={() => setFocused("password")}
                                        onBlur={() => setFocused(null)}
                                    />
                                    <p className='w-72 pl-4 pt-1 text-sm text-gray'>
                                        {PASSWORD_RULE_TEXT}
                                    </p>
                                </div>
                                <div className='flex flex-col'>
                                    <label
                                        className={`text-lg pl-4 ${
                                            focused === "confirm"
                                                ? "text-blue"
                                                : ""
                                        } transition-colors duration-500`}
                                    >
                                        Confirm new password
                                    </label>
                                    <input
                                        className={inputClass}
                                        type='password'
                                        id='confirmPassword'
                                        name='confirmPassword'
                                        autoComplete='new-password'
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        onFocus={() => setFocused("confirm")}
                                        onBlur={() => setFocused(null)}
                                    />
                                    {mismatch && (
                                        <p className='w-72 pl-4 pt-1 text-sm text-red'>
                                            {"Passwords don't match"}
                                        </p>
                                    )}
                                </div>

                                <input
                                    type='submit'
                                    disabled={!canSubmit}
                                    className={`w-48 px-4 py-2 mt-8 rounded-[30px] text-lg transition-colors duration-500 ${
                                        canSubmit
                                            ? "bg-dark text-white hover:text-light hover:bg-blue cursor-pointer"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                    value={
                                        loading
                                            ? "Saving..."
                                            : done
                                            ? "Done"
                                            : "Reset password"
                                    }
                                />
                            </form>
                        )}

                        <div className='flex justify-center items-center gap-4 text-lg mt-8'>
                            <Link
                                className='text-blue hover:text-darkblue transition-all duration-500'
                                href='/forgot-password'
                            >
                                Request a new link
                            </Link>
                            <span className='text-livid'>|</span>
                            <Link
                                className='text-blue hover:text-darkblue transition-all duration-500'
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
