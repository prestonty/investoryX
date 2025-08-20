"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function VerifyEmail() {
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string>("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            verifyEmailToken(token);
        } else {
            setError("No verification token provided");
        }
    }, [token]);

    const verifyEmailToken = async (token: string) => {
        setVerifying(true);
        try {
            await verifyEmail(token);
            setVerified(true);
            toast.success("Email verified successfully! You can now log in.");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Verification failed";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className='min-h-screen bg-light flex items-center justify-center'>
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
                }}
            />

            <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold text-dark mb-4'>
                        Email Verification
                    </h1>

                    {verifying && (
                        <div className='mb-4'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto'></div>
                            <p className='text-gray-600 mt-2'>
                                Verifying your email...
                            </p>
                        </div>
                    )}

                    {verified && (
                        <div className='mb-4'>
                            <div className='text-green-500 text-6xl mb-2'>
                                ✓
                            </div>
                            <p className='text-green-600 font-semibold'>
                                Email Verified!
                            </p>
                            <p className='text-gray-600 mt-2'>
                                Your account is now active. Redirecting to
                                login...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className='mb-4'>
                            <div className='text-red-500 text-6xl mb-2'>✗</div>
                            <p className='text-red-600 font-semibold'>
                                Verification Failed
                            </p>
                            <p className='text-gray-600 mt-2'>{error}</p>
                            <button
                                onClick={() => router.push("/sign-up")}
                                className='mt-4 bg-blue text-white px-4 py-2 rounded hover:bg-blue-dark transition-colors'
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!verifying && !verified && !error && (
                        <p className='text-gray-600'>
                            Please wait while we verify your email...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
