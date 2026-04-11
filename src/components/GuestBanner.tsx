"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isGuestMode } from "@/lib/auth";

export default function GuestBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(isGuestMode());
    }, []);

    if (!show) return null;

    return (
        <div className='bg-blue/10 border border-blue/30 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-dark'>
            <span>
                {"You're browsing as a guest. Your data is saved locally. "}
                <Link
                    href='/sign-up'
                    className='text-blue font-semibold hover:underline'
                >
                    Create a free account
                </Link>{" "}
                to save permanently.
            </span>
            <button
                type='button'
                onClick={() => setShow(false)}
                className='text-gray hover:text-dark ml-4 flex-none'
                aria-label='Dismiss banner'
            >
                ✕
            </button>
        </div>
    );
}
