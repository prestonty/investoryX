import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamic = "force-dynamic";

export default function ResetPassword() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen flex items-center justify-center bg-light'>
                    <p className='text-dark'>Loading...</p>
                </div>
            }
        >
            <ResetPasswordClient />
        </Suspense>
    );
}
