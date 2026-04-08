"use client";

import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import StockRow from "@/components/StockRow";
import IndexTable from "@/components/IndexTable";
import { Article } from "@/types/article";
import { TopStock } from "@/types/topStock";
import {
    getTopGainers,
    getTopLosers,
    getMostActive,
    getStockNews,
    getDefaultIndexes,
} from "@/lib/api";

type Tab = "gainers" | "losers" | "active";

const MAX_ARTICLES = 4;

export default function Dashboard() {
    const [news, setNews] = useState<Article[] | null>(null);
    const [gainers, setGainers] = useState<TopStock[] | null>(null);
    const [losers, setLosers] = useState<TopStock[] | null>(null);
    const [mostActive, setMostActive] = useState<TopStock[] | null>(null);
    const [etfData, setEtfData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>("gainers");

    const trendingStockTabs = [
        ["gainers", "Gainers"],
        ["losers", "Losers"],
        ["active", "Active"],
    ] as [Tab, string][];

    useEffect(() => {
        Promise.all([
            getStockNews(MAX_ARTICLES)
                .then(setNews)
                .catch(() => setNews([])),
            getTopGainers()
                .then(setGainers)
                .catch(() => setGainers([])),
            getTopLosers()
                .then(setLosers)
                .catch(() => setLosers([])),
            getMostActive()
                .then(setMostActive)
                .catch(() => setMostActive([])),
            getDefaultIndexes()
                .then(setEtfData)
                .catch(() => setEtfData([])),
        ]);
    }, []);

    const tabData: Record<Tab, TopStock[] | null> = {
        gainers,
        losers,
        active: mostActive,
    };

    const activeStocks = tabData[activeTab];

    return (
        <div className='bg-light font-[family-name:var(--font-geist-sans)]'>
            <div className='mb-4'>
                <Navbar search={true} />
            </div>

            <div className='w-[94%] mx-auto flex flex-col gap-6 pb-10'>
                {/* Top row: News (2fr) + Trending (1fr) */}
                <div className='grid grid-cols-1 xl:grid-cols-2-1 gap-6 items-stretch'>
                    {/* Latest News */}
                    <div className='bg-white rounded-[30px] shadow-dark-md px-10 py-6 h-full'>
                        <h2 className='text-dark text-2xl'>Latest News</h2>
                        <hr className='h-[4px] border-none bg-blue mt-1 rounded-[4px]' />
                        <div className='mt-2'>
                            {news != null ? (
                                news.length > 0 ? (
                                    news.map((article, i) => (
                                        <ArticleCard
                                            key={i}
                                            article={article}
                                        />
                                    ))
                                ) : (
                                    <p className='text-gray text-sm mt-4'>
                                        No news available.
                                    </p>
                                )
                            ) : (
                                <div className='flex justify-center items-center h-40'>
                                    <FourSquare
                                        color='#181D2A'
                                        size='medium'
                                        text=''
                                        textColor=''
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trending Stocks */}
                    <div className='bg-white rounded-[30px] shadow-dark-md px-10 py-6 h-full'>
                        <h2 className='text-dark text-2xl'>Trending Stocks</h2>
                        <hr className='h-[4px] border-none bg-blue mt-1 rounded-[4px]' />

                        {/* Tab buttons */}
                        <div className='flex border border-[#E0E3EA] rounded-xl overflow-hidden mt-4 mb-1'>
                            {trendingStockTabs.map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex-1 py-2 text-sm font-semibold border-r border-[#E0E3EA] last:border-r-0 transition-colors ${
                                        activeTab === key
                                            ? "bg-blue text-white"
                                            : "bg-white text-dark hover:bg-light"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Stock list */}
                        {activeStocks != null ? (
                            activeStocks.length > 0 ? (
                                <div>
                                    {activeStocks.map((stock, i) => (
                                        <StockRow key={i} stock={stock} />
                                    ))}
                                </div>
                            ) : (
                                <p className='text-gray text-sm mt-4'>
                                    No data available.
                                </p>
                            )
                        ) : (
                            <div className='flex justify-center items-center h-40'>
                                <FourSquare
                                    color='#181D2A'
                                    size='medium'
                                    text=''
                                    textColor=''
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Market Indices — full width */}
                <div className='bg-white rounded-[30px] shadow-dark-md px-10 py-6'>
                    <h2 className='text-dark text-2xl'>Market Indices</h2>
                    <hr className='h-[4px] border-none bg-blue mt-1 rounded-[4px]' />
                    <div className='mt-5'>
                        {etfData.length > 0 ? (
                            <IndexTable data={etfData} />
                        ) : (
                            <div className='flex justify-center items-center h-40'>
                                <FourSquare
                                    color='#181D2A'
                                    size='medium'
                                    text=''
                                    textColor=''
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
