"use client";

import { useState, useEffect } from "react";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";
import { dateConverter } from "@/utils/helper";
import Image from "next/image";

import Navbar from "@/components/Navbar";
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

            <div className='w-[94%] mx-auto flex flex-col h-[92vh] mb-6'>
                <div className='h-100 bg-white rounded-[30px] shadow-dark-md px-10 mb-6 py-6'>
                    <div className='mb-12'>
                        <h2 className='text-dark text-2xl'>Latest News</h2>
                    </div>
                    <div className='h-fit min-h-screen'>
                        {news != null ? (
                            news.map((article, index) => (
                                <a
                                    key={index}
                                    href={article.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <div className='flex my-4 hover:bg-light transition-colors duration-1000'>
                                        <Image
                                            src={article.image}
                                            className='min-w-[50px] max-w-[400px]'
                                            width={400}
                                            height={0}
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
                                            <div className='flex flex-col gap-y-2'>
                                                <p className='text-dark'>
                                                    {`Relevant Tickers: ${
                                                        article?.tickers?.length
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
            </div>
        </div>
    );
}
