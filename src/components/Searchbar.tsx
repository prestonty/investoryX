"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Item } from "@/types/item";

import { ClipLoader } from "react-spinners";
import { FaSearch } from "react-icons/fa";
import defaultOptions from "@/lib/defaults/search_stock_defaults.json";
import { motion, AnimatePresence } from "framer-motion";

interface SearchbarProps {
    options: { value: string; label: string }[];
    onChange: (selectedOption: { value: string; label: string } | null) => void;
    onSelect?: (item: { value: string; label: string }) => void;
}

// TODO recreate this component using a better component not a select!!!

export default function Searchbar(props: SearchbarProps) {
    const router = useRouter();
    const { options, onChange, onSelect } = props;

    const [filterString, setFilterString] = useState<string>("");
    const [results, setResults] = useState<Item[]>([]);

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);

    const borderColor = isFocused
        ? "border-blue"
        : isHovered
        ? "border-lightblue"
        : "border-dark";

    const iconColor = isFocused
        ? "text-blue"
        : isHovered
        ? "text-lightblue"
        : "text-dark";

    const optionsToShow =
        results.length > 0
            ? results
            : options.length > 0
            ? options
            : defaultOptions;

    useEffect(() => {
        // Make API call every 0.3 sceonds after input is changed
        const controller = new AbortController();

        const delayDebounce = setTimeout(() => {
            const handleSearch = async () => {
                if (!filterString.trim()) {
                    setResults([]);
                    return;
                }
                try {
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_URL}/api/stocks/search/${filterString}`,
                        {
                            signal: controller.signal,
                        },
                    );
                    setResults(res.data);
                } catch (error: any) {
                    if (axios.isCancel(error)) {
                        console.log("Request canceled:", error.message);
                    } else {
                        console.error("Search error:", error);
                    }
                }
            };

            handleSearch();
        }, 300);

        // Cleanup: cancel timeout AND request
        return () => {
            clearTimeout(delayDebounce);
            controller.abort(); // cancel the Axios request if input changes to avoid spamming old requests
        };
    }, [filterString]);

    const navigateToStock = (ticker: string) => {
        setLoading(true);
        router.push(`/stock/${ticker}`);
    };

    const handleSelect = (item: { value: string; label: string }) => {
        onChange(item);
        if (onSelect) {
            onSelect(item);
            return;
        }
        navigateToStock(item.value);
    };

    return (
        <div
            className={`min-w-24 flex justify-center items-center fit relative z-10 bg-white border-2 ${borderColor} rounded-full ml-6 px-4 py-2 transition-colors duration-500 outline-none`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className='relative w-full flex gap-x-2 pl-6 items-center'>
                {loading ? (
                    <ClipLoader
                        loading={true}
                        size={20}
                        color='#748EFE'
                        className={`absolute -left-1 text-dark w-5 h-5 transition-colors duration-500`}
                    />
                ) : (
                    // replace
                    <FaSearch
                        className={`absolute -left-1 text-dark w-5 h-5 transition-colors duration-500 ${iconColor}`}
                    />
                )}
                <input
                    type='text'
                    value={filterString}
                    onChange={(e) => setFilterString(e.target.value)}
                    placeholder='Search'
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className='text-lg w-full text-dark border-none focus:outline-none focus:ring-0'
                />
            </div>

            <AnimatePresence>
                {isFocused && (
                    <motion.ul
                        className='absolute left-0 top-12 w-full bg-white rounded-xl overflow-y-scroll max-h-60 z-[400] shadow-lg border border-light'
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {optionsToShow.map((item, index) => (
                            <motion.li
                                className='text-dark w-full border-b-2 border-light z-2'
                                key={index}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{
                                    duration: 0.15,
                                    delay: index * 0.02,
                                }}
                            >
                                <button
                                    className='text-left hover:bg-light w-full px-4 py-1'
                                    onClick={() => {
                                        handleSelect(item);
                                    }}
                                >
                                    {item.label}
                                </button>
                                {/* <Link
                                    className="text-left hover:bg-light w-full px-4 py-1"
                                    href={`/stocks/${item.value}`}
                                >
                                    {item.label}
                                </Link> */}
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
