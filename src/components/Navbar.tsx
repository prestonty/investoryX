"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

export default function Navbar() {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center px-[4%]">
            <button type="button" onClick={() => router.push("/")}>
                <div className="flex items-center">
                    <img
                        src="/format-investory-logo.png"
                        width={60}
                        className=""
                        alt="article thumbnail"
                    />
                    <p className="text-dark text-center text-4xl font-semibold">
                        Investory
                    </p>
                </div>
            </button>

            <div className="flex w-[22rem] justify-between">
                <Link className="w-100 text-dark text-xl" href="/latest-news">
                    Latest News
                </Link>

                <Link className="w-100 text-dark text-xl" href="/dashboard">
                    Dashboard
                </Link>
                <Link className="w-100 text-dark text-xl" href="/watch-list">
                    Watch List
                </Link>
            </div>

            {/* It should display log out or log in */}
            <div className="flex">
                <p className="text-dark text-dark text-xl">Log Out</p>
            </div>
        </div>
    );
}
