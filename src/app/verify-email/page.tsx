import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamic = "force-dynamic";

export default function VerifyEmail() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                    <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
                        <div className='text-center'>
                            <h1 className='text-2xl font-bold text-gray-900'>
                                Email Verification
                            </h1>
                            <p className='text-gray-600 mt-4'>Loading...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <VerifyEmailClient />
        </Suspense>
    );
}
