"use client";

import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";

import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import { Article } from "@/types/article";

export default function Dashboard() {
    const [news, setNews] = useState<Article[] | null>(null);

    useEffect(() => {
        const fetchNew = async () => {
            try {
                const result = await axios(
                    `${process.env.NEXT_PUBLIC_URL}/stock-news`,
                );
                setNews(result.data);
            } catch (error) {
                console.error("Error fetching news: ", error);
            }
        };
        fetchNew();
    }, []);

    return (
        <div className='bg-light font-[family-name:var(--font-geist-sans)] mb-6'>
            <div className='mb-4'>
                <Navbar search={true} />
            </div>

            <div className='w-[94%] mx-auto flex flex-col mb-6'>
                <div className='bg-white rounded-[30px] shadow-dark-md px-10 mb-6 py-6'>
                    <h2 className='text-dark text-2xl'>Latest News</h2>
                    <hr className='h-[4px] border-none bg-blue mt-1 mb-4 rounded-[4px]' />
                    <div>
                        {news != null ? (
                            news.length > 0 ? (
                                news.map((article, index) => (
                                    <ArticleCard key={index} article={article} />
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
            </div>
        </div>
    );
}
