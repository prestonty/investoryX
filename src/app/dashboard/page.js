"use client";

import { React, useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators"

import Navbar from "components/Navbar";

import axios from "axios";

import { dateConverter } from "Utilities/helper";

export default function LatestNews() {
    const [news, setNews] = useState([]);
    const [indices, setIndices] = useState([]);

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

        fetchNew();
        fetchIndices();
    }, []);

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)]">
            <div className="h-[6vh] flex flex-col justify-evenly mb-[2vh]">
                <Navbar />
            </div>
            {/* I need to Create a layout and render my dashboard inside this layout along with the navbar positioned at the top!!! */}

            {/* justify-center */}
            <div className="w-[94%] mx-auto flex flex-col h-[92vh]">
                <div className="h-[10%] bg-white rounded-[30px] shadow-dark-md px-10 flex items-center mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="grid grid-cols-12-5 h-[70%]">
                    <div className="content-between mr-6">
                        {/* h-[58%] */}
                        <div className="h-fit bg-white rounded-[30px] shadow-dark-md px-10 py-6 mb-6">
                            <h2 className="text-dark text-2xl">Latest News</h2>

                            <div className="h-fit">
                                {Array.isArray(news) ? (
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

                        <div className="h-[40%] bg-white rounded-[30px] shadow-dark-md px-10 py-6">
                            <h2 className="text-dark text-2xl">Market Indexes</h2>

                            <div className="h-fit">
                                {Array.isArray(indices) ? (
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

                    <div className="bg-white rounded-[30px] shadow-dark-md px-10 py-6">
                        <p className="text-dark text-2xl">Trending</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
