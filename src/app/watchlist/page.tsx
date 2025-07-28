"use client";

import Navbar from "@/components/Navbar";
import StockWatchItem from "@/components/StockWatchItem";

export default function WatchList() {
    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)]">
            <Navbar />

            {/* Make the search bar a component them reuse it in dashboard and watchlist (Give it an array to pass into with all possible options) */}

            {/* Display the watchlist here (make it very simple, its designed mobile first) */}

            <div className="flex-col w-2/5 mx-auto min-w-[30rem]">
                <div className="h-[4rem] bg-white rounded-[30px] shadow-dark-md px-10 flex items-center mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="h-full bg-white rounded-[30px] shadow-dark-md px-10 py-6 flex items-center mb-6">
                    {/* Search bar component? */}

                    <div className="flex-col w-full px-[4%] mx-auto gap-y-10">
                        <StockWatchItem />
                        <hr className="my-4" />
                        <StockWatchItem />
                        <hr className="my-4" />
                        <StockWatchItem />
                        <hr className="my-4" />
                        <StockWatchItem />
                        <hr className="my-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
