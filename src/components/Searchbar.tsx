"use client";
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

import axios from "axios";
import { Item } from "@/types/item";

interface SearchbarProps {
    options: { value: string; label: string }[];
    onChange: (selectedOption: { value: string; label: string } | null) => void;
}

// TODO recreate this component using a better component not a select!!!

export default function Searchbar(props: SearchbarProps) {
    const [filterString, setFilterString] = useState<string>("");
    const [results, setResults] = useState<Item[]>([]);

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
                        }
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

    const borderColor = isFocused
        ? "border-blue"
        : isHovered
        ? "border-lightblue"
        : "border-black";

    const iconColor = isFocused
        ? "text-blue"
        : isHovered
        ? "text-lightblue"
        : "text-black";

    return (
        <div
            className={`min-w-24 flex justify-center items-center fit relative bg-white border-2 ${borderColor} rounded-full px-4 py-2 transition-colors duration-500 outline-none`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full flex gap-x-2 pl-6 items-center">
                <FaSearch
                    className={`absolute -left-1 text-black w-5 h-5 transition-colors duration-500 ${iconColor}`}
                />
                <input
                    type="text"
                    value={filterString}
                    onChange={(e) => setFilterString(e.target.value)}
                    placeholder="Search items..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="text-lg w-full text-black border-none focus:outline-none focus:ring-0"
                />
            </div>

            <ul className="absolute top-12 bg-white rounded-xl py-2 px-4 overflow-y-scroll max-h-60">
                {results.map((item, index) => (
                    <li className="text-black py-1" key={index}>
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
