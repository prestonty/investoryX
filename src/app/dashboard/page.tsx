"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import { dateConverter } from "@/utils/helper";
import Navbar from "@/components/Navbar";
import { Article } from "@/types/article";
import { Index } from "@/types/index";
import { TopStock } from "@/types/topStock";

export default function LatestNews() {
    const [news, setNews] = useState<Article[] | null>(null);
    const [indices, setIndices] = useState<Index[] | null>(null);
    const [gainers, setGainers] = useState<TopStock[] | null>(null);
    const [losers, setLosers] = useState<TopStock[] | null>(null);
    const [mostTraded, setMostTraded] = useState<TopStock[] | null>();

    const MAX_ARTICLES = 3;

    useEffect(() => {
        const fetchNew = async () => {
            try {
                const result = await axios(
                    `${process.env.NEXT_PUBLIC_URL}/stock-news?max_articles=${MAX_ARTICLES}`
                );
                setNews(result.data);
            } catch (error) {
                console.error("Error fetching news: ", error);
                setNews([] as Article[]); // set to null article
            }
        };

        // const fetchIndices = async () => {
        //     try {
        //         const result = await axios(
        //             `${process.env.NEXT_PUBLIC_URL}/getIndices`
        //         );
        //         setIndices(result.data);
        //     } catch (error) {
        //         console.error("Error fetching indices: ", error);
        //     }
        // };

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

        // const fetchCompanyData = async () => {
        //     console.log("start here");
        //     try {
        //         const result = await axios(
        //             `${process.env.NEXT_PUBLIC_URL}/getCompanyData`,
        //             {
        //                 params: {
        //                     searchPrompt: "IXIC",
        //                 },
        //             }
        //         );
        //         setIndices(result.data);
        //         console.log(result.data);
        //     } catch (error) {
        //         console.error("Error fetching company data:", error);
        //     }
        // };

        fetchNew();
        // // fetchIndices();
        // fetchTopGainersLosers();
        // fetchCompanyData();
    }, []);

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)]">
            <div className="mb-4">
                <Navbar search={true} />
            </div>
            {/* justify-center */}
            <div className="w-[94%] mx-auto flex flex-col">
                <div className="h-[5rem] bg-white rounded-[30px] shadow-dark-md px-10 flex items-center mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="grid grid-cols-12-5">
                    <div className="content-between mr-6">
                        {/* Latest News ------------------------------------------------------------------------------------------------------------ */}
                        <div className="h-fit bg-white rounded-[30px] shadow-dark-md px-10 py-6 mb-6">
                            <h2 className="text-dark text-2xl">Latest News</h2>
                            <hr className="h-[4px] border-none bg-blue mt-1 text-blue rounded-[4px]" />

                            <div className="h-fit">
                                {news != null ? (
                                    news.map((article, index) => (
                                        <a
                                            key={index}
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="flex my-4">
                                                <img
                                                    src={article.image}
                                                    className="w-[20%]"
                                                    alt="article thumbnail"
                                                />

                                                <div className="ml-4 flex flex-col justify-between pb-2">
                                                    <div>
                                                        <p className="text-dark text-xl font-medium">
                                                            {article.headline}
                                                        </p>
                                                        <p className="text-dark">
                                                            {article.source}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <p className="text-dark">
                                                            {`Relevant Tickers: ${article.tickers.join(
                                                                ", "
                                                            )}`}
                                                        </p>
                                                        <p className="text-dark">
                                                            {article.datetime}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <FourSquare
                                            color="#181D2A"
                                            size="medium"
                                            text=""
                                            textColor=""
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Market Indexes ------------------------------------------------------------------------------------------------------------ */}
                        <div className="bg-white rounded-[30px] shadow-dark-md px-10 py-6">
                            <h2 className="text-dark text-2xl">
                                Market Indexes
                            </h2>
                            <hr className="h-[4px] border-none bg-blue text-blue mt-1 rounded-[4px]" />

                            <div className="h-fit">
                                {indices != null ? (
                                    indices.map((stockIndex, index) => (
                                        <div key={index} className="flex">
                                            <p className="text-dark">
                                                Placeholder Index Name
                                            </p>
                                            <p className="text-dark">
                                                {stockIndex.c}
                                            </p>
                                            <p className="text-dark">
                                                {stockIndex.d}
                                            </p>
                                            <p className="text-dark">
                                                {stockIndex.dp}%
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-100 justify-center align-center content-center items-center">
                                        {/* <FourSquare
                                            color="#181D2A"
                                            size="medium"
                                            text=""
                                            textColor=""
                                        /> */}
                                        <div>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                            <p>asdasd</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trending ------------------------------------------------------------------------------------------------------------ */}

                    <div className="bg-white rounded-[30px] w-100 shadow-dark-md px-10 py-6">
                        <p className="text-dark text-2xl">Trending</p>
                        <hr className="h-[4px] border-none bg-blue text-blue mt-1 rounded-[4px]" />
                        <div className="flex flex-col h-full mt-[8%]">
                            <div className="flex flex-col justify-evenly h-[12%]">
                                <p className="text-dark text-lg mb-2 underline">
                                    Top Gainers
                                </p>

                                {gainers != null && gainers.length > 0 ? (
                                    gainers.map((gainer, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <p className="text-dark text-xl">
                                                    {gainer.ticker}
                                                </p>
                                                {/* <p className="text-dark text-xl">{"$" + gainer.price}</p> */}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-green text-xl">
                                                    {"+" +
                                                        gainer.change_percentage}
                                                </p>
                                                {/* <p className="text-green text-xl">{"+" + gainer.change_amount}</p> */}
                                            </div>
                                        </div>
                                    ))
                                ) : gainers != null && gainers.length === 0 ? (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <p className="text-dark">
                                            No gainers available - ran out of
                                            API credits
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <FourSquare
                                            color="#181D2A"
                                            size="medium"
                                            text=""
                                            textColor=""
                                        />
                                    </div>
                                )}
                            </div>

                            <hr className="my-4" />

                            <div className="flex flex-col justify-evenly h-[12%]">
                                <p className="text-dark text-lg mb-2 underline">
                                    Top Losers
                                </p>
                                {losers != null && losers.length > 0 ? (
                                    losers.map((loser, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <p className="text-dark text-xl">
                                                    {loser.ticker}
                                                </p>
                                                {/* <p className="text-dark text-xl">{"$" + loser.price}</p> */}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-red text-xl">
                                                    {loser.change_percentage}
                                                </p>
                                                {/* <p className="text-red text-xl">{loser.change_amount}</p> */}
                                            </div>
                                        </div>
                                    ))
                                ) : losers != null && losers.length === 0 ? (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <p className="text-dark">
                                            No losers available - ran out of API
                                            credits
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <FourSquare
                                            color="#181D2A"
                                            size="medium"
                                            text=""
                                            textColor=""
                                        />
                                    </div>
                                )}
                            </div>

                            <hr className="my-4" />

                            <p className="text-dark text-lg mb-2 underline">
                                Most Actively Traded
                            </p>
                            <div className="flex flex-col justify-evenly h-[30%]">
                                {mostTraded != null && mostTraded.length > 0 ? (
                                    mostTraded.map((traded, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between"
                                        >
                                            <p className="text-dark text-xl">
                                                {traded.ticker}
                                            </p>

                                            <div className="flex justify-between w-[75%]">
                                                <p className="text-dark text-lg">
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
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <p className="text-dark">
                                            No data available - ran out of API
                                            credits
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <FourSquare
                                            color="#181D2A"
                                            size="medium"
                                            text=""
                                            textColor=""
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
