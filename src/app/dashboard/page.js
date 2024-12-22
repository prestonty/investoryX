"use client";

import { React, useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
    const [news, setNews] = useState();

    useEffect(() => {
        const fetchNew = async () => {
            // hard coded for now
            try {
                const result = await axios("http://localhost:5000/getNews");
                setNews(result);
                console.log("frontend received the data");
            } catch (error) {
                console.error("Error fetching news: ", error);
            }
        };

        fetchNew();
    }, []);

    return (
        <div className="bg-light">
            {/* I need to Create a layout and render my dashboard inside this layout along with the navbar positioned at the top!!! */}

            <div className="w-[90%] mx-auto flex flex-col justify-center h-[100vh]">
                <div className="h-[10%] bg-white rounded-[30px] shadow-md px-6 flex items-center mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="grid grid-cols-12-5 h-[70%]">
                    <div className="content-between mr-6">
                        <div className="h-[58%] bg-white rounded-[30px] shadow-md px-6 py-4 mb-6">
                            <h2 className="text-dark">Latest News</h2>

                            <div className="h-[100%]">
                                {news != null ? (
                                    news.map((item, index) => (
                                        <div key={index}>
                                            <p className="text-dark">
                                                {item.headline}
                                            </p>
                                            <p className="text-dark">
                                                {item.category}
                                            </p>

                                            <p className="text-dark">
                                                {item.datetime}
                                            </p>

                                            <image src={item.image} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-[80%] justify-center align-center content-center items-center">
                                        <p className="text-dark">Loading...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-[40%] bg-white rounded-[30px] shadow-md px-6 py-4">
                            <h2 className="text-dark">Market Indexes</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] shadow-md px-6 py-4">
                        <p className="text-dark">Trending</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
