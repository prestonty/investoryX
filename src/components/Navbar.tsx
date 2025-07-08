"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import UnderlineWrapper from "@/components/animations/UnderlineWrapper";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center px-[3%] min-h-[2rem] py-2 relative">
            <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
            >
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
            </motion.div>

            <div className="flex justify-center gap-x-[3rem] absolute left-1/2 transform -translate-x-1/2">
                <UnderlineWrapper>
                    <Link
                        className="w-100 text-dark text-xl"
                        href="/latest-news"
                    >
                        Latest News
                    </Link>
                </UnderlineWrapper>

                <UnderlineWrapper>
                    <Link className="w-100 text-dark text-xl" href="/dashboard">
                        Dashboard
                    </Link>
                </UnderlineWrapper>

                <UnderlineWrapper>
                    <Link className="w-100 text-dark text-xl" href="/watchlist">
                        Watch List
                    </Link>
                </UnderlineWrapper>
            </div>

            {/* It should display log out or log in */}
            <div className="flex-none">
                <UnderlineWrapper>
                    {/* This needs to be a button (TODO) */}
                    <p className="text-dark text-dark text-xl">Log Out</p>
                </UnderlineWrapper>
            </div>
        </div>
    );
}
