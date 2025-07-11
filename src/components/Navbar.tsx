"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import UnderlineWrapper from "@/components/animations/UnderlineWrapper";
import Link from "next/link";
import { motion } from "framer-motion";
import Searchbar from "@/components/Searchbar";

interface NavbarProps {
    search?: boolean;
}

export default function Navbar(props: NavbarProps) {
    const router = useRouter();
    const { search = false } = props;

    const [searchStock, setSearchStock] = useState<{
        label: string;
        value: string;
    } | null>(null);
    const stockList = [
        { label: "APPL", value: "appl" },
        { label: "NVDA", value: "nvda" },
        { label: "GOOGL", value: "googl" },
        { label: "AMZN", value: "amzn" },
        { label: "MSFT", value: "msft" },
        { label: "META", value: "meta" },
    ];

    return (
        <div
            className={`flex items-center px-[3%] min-h-[2rem] py-2 relative ${
                search ? "" : "justify-between"
            }`}
        >
            <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className={search ? "mr-10" : ""}
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

            {/* TODO Add a Drawer Icon for Small screens */}
            <div
                className={`flex justify-center gap-x-6 lg:gap-x-10 ${
                    search ? "" : "absolute left-1/2 transform -translate-x-1/2"
                }`}
            >
                <UnderlineWrapper>
                    <Link
                        className="w-100 text-dark text-md text-nowrap lg:text-xl"
                        href="/latest-news"
                    >
                        Latest News
                    </Link>
                </UnderlineWrapper>

                <UnderlineWrapper>
                    <Link
                        className="w-100 text-dark text-md text-nowrap lg:text-xl"
                        href="/dashboard"
                    >
                        Dashboard
                    </Link>
                </UnderlineWrapper>

                <UnderlineWrapper>
                    <Link
                        className="w-100 text-dark text-md text-nowrap lg:text-xl"
                        href="/watchlist"
                    >
                        Watch List
                    </Link>
                </UnderlineWrapper>
            </div>

            <div className="flex items-center gap-x-4 w-fit ml-auto">
                {search && (
                    <Searchbar options={stockList} onChange={setSearchStock} />
                )}

                <div className="flex-none">
                    <UnderlineWrapper>
                        <p className="text-dark text-dark text-xl">Log Out</p>
                    </UnderlineWrapper>
                </div>
            </div>
        </div>
    );
}
