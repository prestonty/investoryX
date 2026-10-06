"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/api";

export default function VerifyEmailClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [verifyStatus, setStatus] = useState<"loading" | "success" | "error">(
        "loading",
    );
    const [verifyMessage, setMessage] = useState("");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            try {
                const result = await verifyEmail(token);
                setStatus("success");
                setMessage(result.message);
                // Redirect to login after 3 seconds
                setTimeout(() => router.push("/login"), 3000);
            } catch (error) {
                setStatus("error");
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Verification failed",
                );
            }
        };

        verify();
    }, [token, router]);

    // Without a token there is nothing to verify.
    const status = token ? verifyStatus : "error";
    const message = token ? verifyMessage : "No verification token found";

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 font-(family-name:--font-geist-sans)'>
            <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-dark'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold'>Email Verification</h1>

                    {status === "loading" && (
                        <div className='mt-4'>
                            <p className='text-gray-600 font-semibold'>
                                Verifying your email...
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className='mt-4'>
                            <p className='font-semibold'>{message}</p>
                            <p className='font-semibold mt-2'>
                                Redirecting to login page...
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className='mt-4'>
                            <p className='text-red font-semibold'>{message}</p>
                            <button
                                onClick={() => router.push("/login")}
                                className='mt-4 px-4 py-2 bg-blue text-white font-semibold rounded-sm hover:bg-blue-700'
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
