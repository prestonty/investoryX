"use client";

import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";
import { dateConverter } from "Utilities/helper";

import Navbar from "components/Navbar";
import { Article } from "types/article";

export default function Dashboard() {
    const [news, setNews] = useState<Article[] | null>(null);

    useEffect(() => {
        const fetchNew = async () => {
            try {
                const result = await axios(
                    `${process.env.NEXT_PUBLIC_URL}/getNews`
                );
                setNews(result.data);
            } catch (error) {
                console.error("Error fetching news: ", error);
            }
        };
        fetchNew();
    }, []);

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)] mb-6">
            <div className="h-[6vh] flex flex-col justify-evenly mb-[2vh]">
                <Navbar />
            </div>

            <div className="w-[94%] mx-auto flex flex-col h-[92vh] mb-6">
                <div className="h-100 bg-white rounded-[30px] shadow-dark-md px-10 mb-6 py-6">
                    <div className="mb-12">
                        <h2 className="text-dark text-2xl">Latest News</h2>
                    </div>
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
    );
}
