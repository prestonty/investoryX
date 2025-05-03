"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

export default function Navbar() {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center px-[4%] gap-x-[4rem] h-[4rem]">
            <Link className="w-fit flex-none" type="button" href="/">
                <div className="w-fit flex items-center">
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
            </Link>

            <div className="flex w-full justify-center gap-x-[3rem]">
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
            <div className="flex-none">
                <p className="text-dark text-dark text-xl">Log Out</p>
            </div>
        </div>
    );
}
