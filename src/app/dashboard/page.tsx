"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import Navbar from "@/components/Navbar";
import { Article } from "@/types/article";
import { TopStock } from "@/types/topStock";
import Image from "next/image";

import { getCurrentUserData, type UserResponse } from "@/lib/auth";

export default function Dashboard() {
    const [news, setNews] = useState<Article[] | null>(null);
    const [gainers, setGainers] = useState<TopStock[] | null>(null);
    const [losers, setLosers] = useState<TopStock[] | null>(null);
    const [mostTraded, setMostTraded] = useState<TopStock[] | null>();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const MAX_ARTICLES = 2;

    // Market Indexes
    const [etfData, setEtfData] = useState<any[]>([]);

    useEffect(() => {
        // Get user data and fetch dashboard data
        const initializeDashboard = async () => {
            try {
                const userData = await getCurrentUserData();
                setUser(userData);
                setIsLoading(false);
            } catch (error) {
                console.error("Error getting user data:", error);
                setIsLoading(false);
            }
        };

        initializeDashboard();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            // Fetch data after user is loaded
            fetchNews();
            fetchEtfs();
        }
    }, [isLoading]);

    const fetchNews = async () => {
        try {
            const result = await axios(
                `${process.env.NEXT_PUBLIC_URL}/stock-news?max_articles=${MAX_ARTICLES}`,
            );
            setNews(result.data);
        } catch (error) {
            console.error("Error fetching news: ", error);
            setNews([] as Article[]); // set to null article
        }
    };

    const fetchEtfs = async () => {
        try {
            const result = await axios(
                `${process.env.NEXT_PUBLIC_URL}/get-default-indexes`,
            );
            setEtfData(result.data);
        } catch (error) {
            console.error("Error fetching indices: ", error);
        }
    };

    // const fetchTopGainersLosers = async () => {
    //     try {
    //         //
    //         const result = await axios(
    //             `${process.env.NEXT_PUBLIC_URL}/getTopGainersLosers`
    //         );
    //         setGainers(result.data.top_gainers);
    //         setLosers(result.data.top_losers);
    //         setMostTraded(result.data.most_actively_traded);
    //     } catch (error) {
    //         console.error("Error fetching top gainers and losers: ", error);
    //     }
    // };

    // fetchIndices();
    // fetchTopGainersLosers();
    // fetchCompanyData();

    // if (isLoading) {
    //     return (
    //         <div className="bg-light min-h-screen flex items-center justify-center">
    //             <FourSquare color="#181D2A" size="large" text="" textColor="" />
    //         </div>
    //     );
    // }

    return (
        <div className='bg-light font-[family-name:var(--font-geist-sans)]'>
            <div className='mb-4'>
                <Navbar search={true} />
            </div>
            {/* justify-center */}
            <div className='w-[94%] mx-auto flex flex-col'>
                <div className='grid grid-cols-1 xl:grid-cols-2-1 gap-6'>
                    <div className='space-y-6'>
                        {/* Latest News ------------------------------------------------------------------------------------------------------------ */}
                        <div className='h-fit bg-white rounded-[30px] shadow-dark-md px-10 py-6'>
                            <h2 className='text-dark text-2xl'>Latest News</h2>
                            <hr className='h-[4px] border-none bg-blue mt-1 text-blue rounded-[4px]' />

                            <div className='h-fit'>
                                {news != null ? (
                                    news.map((article, index) => (
                                        <a
                                            key={index}
                                            href={article.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            <div className='flex my-4'>
                                                <Image
                                                    src={article.image}
                                                    width={200}
                                                    height={200}
                                                    className='w-[20%]'
                                                    alt='article thumbnail'
                                                />

                                                <div className='ml-4 flex flex-col justify-between pb-2'>
                                                    <div>
                                                        <p className='text-dark text-xl font-medium'>
                                                            {article.headline}
                                                        </p>
                                                        <p className='text-dark'>
                                                            {article.source}
                                                        </p>
                                                    </div>

                                                    <div className='flex flex-col'>
                                                        <p className='text-dark'>
                                                            {`Relevant Tickers: ${
                                                                article?.tickers
                                                                    ?.length
                                                                    ? article.tickers.join(
                                                                          ", ",
                                                                      )
                                                                    : "N/A"
                                                            }`}
                                                        </p>
                                                        <p className='text-dark'>
                                                            {article.datetime}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
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

                        {/* Market Indexes ------------------------------------------------------------------------------------------------------------ */}
                        <div className='bg-white rounded-[30px] shadow-dark-md px-10 py-6'>
                            <h2 className='text-dark text-2xl'>
                                Market Indexes
                            </h2>
                            <hr className='h-[4px] border-none bg-blue text-blue mt-1 rounded-[4px]' />

                            <div className='h-fit'>
                                {etfData.length > 0 && (
                                    <div className='grid grid-cols-[3fr_1fr_1fr_1fr] gap-y-4 p-4 mt-4 border-2 border-dark'>
                                        <p className='text-dark'>ETF Name</p>
                                        <p className='text-dark'>Price ($)</p>
                                        <p className='text-dark'>
                                            Price Change ($)
                                        </p>
                                        <p className='text-dark'>
                                            Price Change
                                        </p>
                                    </div>
                                )}
                                {etfData.length > 0 ? (
                                    etfData.map((category, index) => (
                                        <div
                                            key={index}
                                            className='flex flex-col gap-y-4 p-4 border-2 border-dark border-t-0'
                                        >
                                            <p className='text-dark text-xl font-medium'>
                                                {category.title}
                                            </p>
                                            {category.etfs.map(
                                                (stockIndex, index) => (
                                                    <div
                                                        key={index}
                                                        className='grid grid-cols-[3fr_1fr_1fr_1fr] gap-y-4'
                                                    >
                                                        <p className='text-dark'>
                                                            {stockIndex.name} (
                                                            {stockIndex.ticker})
                                                        </p>
                                                        <p className='text-dark'>
                                                            {stockIndex.price}
                                                        </p>
                                                        <p
                                                            className={
                                                                Number(
                                                                    stockIndex.priceChange,
                                                                ) < 0
                                                                    ? "text-red"
                                                                    : Number(
                                                                          stockIndex.priceChange,
                                                                      ) > 0
                                                                    ? "text-green"
                                                                    : "text-gray"
                                                            }
                                                        >
                                                            {
                                                                stockIndex.priceChange
                                                            }
                                                        </p>

                                                        <p
                                                            className={
                                                                Number(
                                                                    stockIndex.priceChangePercent,
                                                                ) < 0
                                                                    ? "text-red"
                                                                    : Number(
                                                                          stockIndex.priceChangePercent,
                                                                      ) > 0
                                                                    ? "text-green"
                                                                    : "text-gray"
                                                            }
                                                        >
                                                            {
                                                                stockIndex.priceChangePercent
                                                            }
                                                            %
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className='flex h-100 justify-center align-center content-center items-center'>
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

                    {/* Trending ------------------------------------------------------------------------------------------------------------ */}

                    <div className='bg-white rounded-[30px] shadow-dark-md px-10 py-6 order-2 xl:order-2'>
                        <p className='text-dark text-2xl'>Trending</p>
                        <hr className='h-[4px] border-none bg-blue text-blue mt-1 rounded-[4px]' />
                        <div className='flex flex-col h-full mt-[8%]'>
                            <div className='flex flex-col justify-evenly h-[12%]'>
                                <p className='text-dark text-lg mb-2 underline'>
                                    Top Gainers
                                </p>

                                {gainers != null && gainers.length > 0 ? (
                                    gainers.map((gainer, index) => (
                                        <div
                                            key={index}
                                            className='flex justify-between'
                                        >
                                            <div className='flex flex-col'>
                                                <p className='text-dark text-xl'>
                                                    {gainer.ticker}
                                                </p>
                                                {/* <p className="text-dark text-xl">{"$" + gainer.price}</p> */}
                                            </div>
                                            <div className='flex flex-col'>
                                                <p className='text-green text-xl'>
                                                    {"+" +
                                                        gainer.change_percentage}
                                                </p>
                                                {/* <p className="text-green text-xl">{"+" + gainer.change_amount}</p> */}
                                            </div>
                                        </div>
                                    ))
                                ) : gainers != null && gainers.length === 0 ? (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
                                        <p className='text-dark'>
                                            No gainers available - ran out of
                                            API credits
                                        </p>
                                    </div>
                                ) : (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
                                        <FourSquare
                                            color='#181D2A'
                                            size='medium'
                                            text=''
                                            textColor=''
                                        />
                                    </div>
                                )}
                            </div>

                            <hr className='my-4' />

                            <div className='flex flex-col justify-evenly h-[12%]'>
                                <p className='text-dark text-lg mb-2 underline'>
                                    Top Losers
                                </p>
                                {losers != null && losers.length > 0 ? (
                                    losers.map((loser, index) => (
                                        <div
                                            key={index}
                                            className='flex justify-between'
                                        >
                                            <div className='flex flex-col'>
                                                <p className='text-dark text-xl'>
                                                    {loser.ticker}
                                                </p>
                                                {/* <p className="text-dark text-xl">{"$" + loser.price}</p> */}
                                            </div>
                                            <div className='flex flex-col'>
                                                <p className='text-red text-xl'>
                                                    {loser.change_percentage}
                                                </p>
                                                {/* <p className="text-red text-xl">{loser.change_amount}</p> */}
                                            </div>
                                        </div>
                                    ))
                                ) : losers != null && losers.length === 0 ? (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
                                        <p className='text-dark'>
                                            No losers available - ran out of API
                                            credits
                                        </p>
                                    </div>
                                ) : (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
                                        <FourSquare
                                            color='#181D2A'
                                            size='medium'
                                            text=''
                                            textColor=''
                                        />
                                    </div>
                                )}
                            </div>

                            <hr className='my-4' />

                            <p className='text-dark text-lg mb-2 underline'>
                                Most Actively Traded
                            </p>
                            <div className='flex flex-col justify-evenly h-[30%]'>
                                {mostTraded != null && mostTraded.length > 0 ? (
                                    mostTraded.map((traded, index) => (
                                        <div
                                            key={index}
                                            className='flex justify-between'
                                        >
                                            <p className='text-dark text-xl'>
                                                {traded.ticker}
                                            </p>

                                            <div className='flex justify-between w-[75%]'>
                                                <p className='text-dark text-lg'>
                                                    {"$" + traded.price}
                                                </p>
                                                <p
                                                    className={
                                                        "text-dark text-xl " +
                                                        (traded.change_amount >=
                                                        0
                                                            ? "text-green"
                                                            : "text-red")
                                                    }
                                                >
                                                    {(traded.change_amount > 0
                                                        ? "+"
                                                        : "") +
                                                        traded.change_percentage}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : mostTraded != null &&
                                  mostTraded.length === 0 ? (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
                                        <p className='text-dark'>
                                            No data available - ran out of API
                                            credits
                                        </p>
                                    </div>
                                ) : (
                                    <div className='flex h-[80%] justify-center align-center content-center items-center'>
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
            </div>
        </div>
    );
}
