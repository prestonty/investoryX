"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/api";

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading",
    );
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("No verification token found");
            return;
        }

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
    }, [searchParams, router]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 font-[family-name:var(--font-geist-sans)]'>
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
                                className='mt-4 px-4 py-2 bg-blue text-white font-semibold rounded hover:bg-blue-700'
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
