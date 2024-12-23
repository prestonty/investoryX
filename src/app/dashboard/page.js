"use client";

import { React, useState, useEffect } from "react";
import Image from "next/image";

import axios from "axios";

import { dateConverter } from "Utilities/helper";

export default function Dashboard() {
    const [news, setNews] = useState();

    useEffect(() => {
        const fetchNew = async () => {
            // hard coded for now
            try {
                const result = await axios("http://localhost:5000/getTopNews");
                setNews(result.data);
            } catch (error) {
                console.error("Error fetching news: ", error);
            }
        };

        console.log("Starting the fetch");
        fetchNew();
        console.log("Ending the fetch");
    }, []);

    return (
        <div className="bg-light">
            {/* I need to Create a layout and render my dashboard inside this layout along with the navbar positioned at the top!!! */}

            <div className="w-[90%] mx-auto flex flex-col justify-center h-[100vh]">
                <div className="h-[10%] bg-white rounded-[30px] shadow-md px-10 flex items-center mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="grid grid-cols-12-5 h-[70%]">
                    <div className="content-between mr-6">
                        {/* h-[58%] */}
                        <div className="h-fit bg-white rounded-[30px] shadow-md px-10 py-6 mb-6">
                            <h2 className="text-dark">Latest News</h2>

                            <div className="h-fit">
                                {news != null ? (
                                    news.map((article, index) => (
                                        <a key={index} href={article.url}>
                                            <div className="flex my-4">
                                                <img
                                                    src={article.image}
                                                    className="w-[20%]"
                                                    alt="article thumbnail"
                                                />

                                                <div>
                                                    <p className="text-dark">
                                                        {article.headline}
                                                    </p>
                                                    {/* <p className="text-dark">
                                                        {article.category}
                                                    </p> */}

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
                                        <p className="text-dark">Loading...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-[40%] bg-white rounded-[30px] shadow-md px-10 py-6">
                            <h2 className="text-dark">Market Indexes</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] shadow-md px-10 py-6">
                        <p className="text-dark">Trending</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
