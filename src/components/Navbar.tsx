"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import UnderlineWrapper from "@/components/animations/UnderlineWrapper";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Searchbar from "@/components/Searchbar";
import { logout, isAuthenticated } from "@/lib/auth";

interface NavbarProps {
    search?: boolean;
}

export default function Navbar(props: NavbarProps) {
    const { search = false } = props;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [searchStock, setSearchStock] = useState<{
        label: string;
        value: string;
    } | null>(null);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    const handleLogout = () => {
        logout();
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const stockList = [
        { label: "APPL", value: "appl" },
        { label: "NVDA", value: "nvda" },
        { label: "GOOGL", value: "googl" },
        { label: "AMZN", value: "amzn" },
        { label: "MSFT", value: "msft" },
        { label: "META", value: "meta" },
    ];

    const navigationItems = [
        { label: "News", href: "/latest-news" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Watchlist", href: "/watchlist" },
        { label: "Simulator", href: "/simulator" },
    ];

    return (
        <div
            className={`flex items-center px-[3%] min-h-[2rem] py-2 relative isolate ${
                search ? "" : "justify-between"
            }`}
        >
            <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className={search ? "mr-10" : ""}
            >
                <Link className='w-fit flex-none' type='button' href='/'>
                    <div className='w-fit flex items-center'>
                        <Image
                            src='/format-investory-logo.webp'
                            width={60}
                            height={60}
                            className=''
                            alt='InvestoryX Logo'
                        />
                        <p className='text-dark text-center text-xl md:text-2xl lg:text-4xl font-semibold'>
                            InvestoryX
                        </p>
                    </div>
                </Link>
            </motion.div>

            {/* Desktop Navigation - Hidden on md and below */}
            <div
                className={`hidden xl:flex justify-center gap-x-10 ${
                    search ? "" : "absolute left-1/2 transform -translate-x-1/2"
                }`}
            >
                {navigationItems.map((item) => (
                    <UnderlineWrapper key={item.href}>
                        <Link
                            className='w-100 text-dark text-md text-nowrap lg:text-xl'
                            href={item.href}
                        >
                            {item.label}
                        </Link>
                    </UnderlineWrapper>
                ))}
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className='xl:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50'
                    >
                        <div className='px-[3%] py-3'>
                            {navigationItems.map((item, index) => (
                                <div
                                    key={item.href}
                                    className={`py-2 ${
                                        index < navigationItems.length - 1
                                            ? "border-b border-gray-100"
                                            : ""
                                    }`}
                                >
                                    <Link
                                        className='block text-dark text-lg font-medium hover:text-blue transition-colors duration-300'
                                        href={item.href}
                                        onClick={() => setIsDrawerOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </div>
                            ))}

                            {/* Logout/Login in mobile drawer */}
                            <div className='border-t border-gray-200 pt-3'>
                                {isLoggedIn ? (
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsDrawerOpen(false);
                                        }}
                                        className='block w-full text-left text-dark text-lg font-medium hover:text-blue transition-colors duration-200'
                                    >
                                        Log Out
                                    </button>
                                ) : (
                                    <Link
                                        href='/login'
                                        className='block text-dark text-lg font-medium hover:text-blue transition-colors duration-300'
                                        onClick={() => setIsDrawerOpen(false)}
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='flex items-center gap-x-4 w-fit ml-auto'>
                {search && (
                    <Searchbar
                        options={stockList}
                        onChange={setSearchStock}
                    />
                )}

                {/* Mobile Drawer Button - Visible on md and below */}
                <div className='xl:hidden'>
                    <button
                        onClick={toggleDrawer}
                        className='p-2 text-dark hover:text-blue transition-colors duration-300'
                        aria-label='Toggle navigation menu'
                    >
                        <svg
                            className='w-6 h-6'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            {isDrawerOpen ? (
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            ) : (
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M4 6h16M4 12h16M4 18h16'
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Desktop Logout/Login - Hidden on md and below */}
                <div className='hidden xl:block flex-none'>
                    {isLoggedIn ? (
                        <UnderlineWrapper>
                            <button
                                onClick={handleLogout}
                                className='text-dark text-xl hover:text-blue transition-colors duration-300'
                            >
                                Log Out
                            </button>
                        </UnderlineWrapper>
                    ) : (
                        <UnderlineWrapper>
                            <Link
                                href='/login'
                                className='text-dark text-xl hover:text-blue transition-colors duration-300'
                            >
                                Login
                            </Link>
                        </UnderlineWrapper>
                    )}
                </div>
            </div>
        </div>
    );
}
