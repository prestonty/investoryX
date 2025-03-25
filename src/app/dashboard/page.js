"use client";

import axios from "axios";
import Navbar from "components/Navbar";

import { React, useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators"
import { dateConverter } from "Utilities/helper";

export default function LatestNews() {
    const [news, setNews] = useState();
    const [indices, setIndices] = useState();
    const [gainers, setGainers] = useState();
    const [losers, setLosers] = useState();
    

    useEffect(() => {
        const fetchNew = async () => {
            try {
                // 
                const result = await axios(`${process.env.NEXT_PUBLIC_URL}/getTopNews`);
                setNews(result.data);
            } catch (error) {
                console.error("Error fetching news: ", error);
                setNews([]);
            }
        };

        const fetchIndices = async () => {
            try {
                // 
                const result = await axios(`${process.env.NEXT_PUBLIC_URL}/getIndices`);
                setIndices(result.data);
            } catch (error) {
                console.error("Error fetching indices: ", error);
                setIndices([]);
            }
        };

        const fetchTopGainersLosers = async () => {
            try {
                // 
                const result = await axios(`${process.env.NEXT_PUBLIC_URL}/getTopGainersLosers`);
                setGainers(result.data.top_gainers);
                setLosers(result.data.top_losers);
                console.log("Starting here");
                console.log(result.data);
                // console.log(result.top_losers);
            } catch (error) {
                console.error("Error fetching top gainers and losers: ", error);
                // setGainers([]);
                // setLosers([]);
            }
        };

        fetchNew();
        // fetchIndices();
        fetchTopGainersLosers();
    }, []);

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)]">
            <div className="h-[6vh] flex flex-col justify-evenly mb-[2vh]">
                <Navbar />
            </div>
            {/* I need to Create a layout and render my dashboard inside this layout along with the navbar positioned at the top!!! */}

            {/* justify-center */}
            <div className="w-[94%] mx-auto flex flex-col">
                <div className="h-[10vh] bg-white rounded-[30px] shadow-dark-md px-10 flex items-center mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="grid grid-cols-12-5">
                    <div className="content-between mr-6">
                        {/* h-[58%] */}
                        {/* Latest News ------------------------------------------------------------------------------------------------------------ */}
                        <div className="h-fit bg-white rounded-[30px] shadow-dark-md px-10 py-6 mb-6">
                            <h2 className="text-dark text-2xl">Latest News</h2>

                            <div className="h-fit">
                                {news != null ? (
                                    news.map((article, index) => (
                                        <a key={index} href={article.url} target="_blank" rel="noopener noreferrer">
                                            <div className="flex my-4">
                                                <img
                                                    src={article.image}
                                                    className="w-[20%]"
                                                    alt="article thumbnail"
                                                />

                                                <div className="ml-4 flex flex-col justify-between pb-2">
                                                    <p className="text-dark text-xl font-medium">
                                                        {article.headline}
                                                    </p>

                                                    <p className="text-dark">
                                                        {dateConverter(
                                                            article.datetime
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <FourSquare color="#181D2A" size="medium" text="" textColor="" />
                                    </div>
                                )}
                            </div>
                        </div>

                    {/* Market Indexes ------------------------------------------------------------------------------------------------------------ */}
                        <div className="bg-white rounded-[30px] shadow-dark-md px-10 py-6">
                            <h2 className="text-dark text-2xl">Market Indexes</h2>

                            <div className="h-fit">
                                {indices != null ? (
                                    indices.map((stockIndex, index) => (
                                        <div key={index} className="flex">
                                            <p className="text-dark">Placeholder Index Name</p>
                                            <p className="text-dark">{stockIndex.c}</p>
                                            <p className="text-dark">{stockIndex.d}</p>
                                            <p className="text-dark">{stockIndex.dp}%</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <FourSquare color="#181D2A" size="medium" text="" textColor="" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trending ------------------------------------------------------------------------------------------------------------ */}

                    <div className="bg-white rounded-[30px] shadow-dark-md px-10 py-6">
                        <p className="text-dark text-2xl">Trending</p>
                        <div className="flex flex-col h-[100%] mt-[8%]">
                            <div className="flex flex-col justify-evenly h-fit">
                            {gainers != null ? (
                                gainers.map((gainer, index) => (
                                    <div key={index} className="flex justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-dark text-xl">{gainer.ticker}</p>
                                            {/* <p className="text-dark text-xl">{"$" + gainer.price}</p> */}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-green text-xl">{"+" + gainer.change_percentage}</p>
                                            {/* <p className="text-green text-xl">{"+" + gainer.change_amount}</p> */}
                                        </div>
                                    </div>
                            ))
                            ) : (
                                <div className="flex h-[80%] justify-center align-center content-center items-center">
                                    <FourSquare color="#181D2A" size="medium" text="" textColor="" />
                                </div>
                            )}
                            </div>

                            <hr className="my-4" />

                            <div className="flex flex-col justify-evenly h-fit">
                            {losers != null ? (
                                losers.map((loser, index) => (
                                    <div key={index} className="flex justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-dark text-xl">{loser.ticker}</p>
                                            {/* <p className="text-dark text-xl">{"$" + loser.price}</p> */}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-red text-xl">{loser.change_percentage}</p>
                                            {/* <p className="text-red text-xl">{loser.change_amount}</p> */}
                                        </div>
                                    </div>
                            ))
                            ) : (
                                <div className="flex h-[80%] justify-center align-center content-center items-center">
                                    <FourSquare color="#181D2A" size="medium" text="" textColor="" />
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
