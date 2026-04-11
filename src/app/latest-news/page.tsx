"use client";

import { useState, useEffect, useRef } from "react";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";

import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import { Article } from "@/types/article";

const PAGE_SIZE = 10;

export default function Dashboard() {
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const totalFetched = useRef(0);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const result = await axios(
                    `${process.env.NEXT_PUBLIC_URL}/stock-news?max_articles=${PAGE_SIZE}`,
                );
                const data: Article[] = result.data;
                setAllArticles(data);
                totalFetched.current = data.length;
                if (data.length < PAGE_SIZE) setHasMore(false);
            } catch (error) {
                console.error("Error fetching news: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const handleNext = async () => {
        const nextPage = page + 1;
        const needed = (nextPage + 1) * PAGE_SIZE;

        if (needed > totalFetched.current) {
            setLoadingMore(true);
            try {
                const result = await axios(
                    `${process.env.NEXT_PUBLIC_URL}/stock-news?max_articles=${needed}`,
                );
                const data: Article[] = result.data;
                setAllArticles(data);
                if (data.length <= totalFetched.current) {
                    setHasMore(false);
                    return;
                }
                totalFetched.current = data.length;
                if (data.length < needed) setHasMore(false);
            } catch (error) {
                console.error("Error fetching more news: ", error);
                return;
            } finally {
                setLoadingMore(false);
            }
        }

        setPage(nextPage);
    };

    const handlePrev = () => {
        if (page > 0) setPage(page - 1);
    };

    const currentArticles = allArticles.slice(
        page * PAGE_SIZE,
        (page + 1) * PAGE_SIZE,
    );
    const isLastPage = !hasMore && (page + 1) * PAGE_SIZE >= allArticles.length;

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
                        {loading ? (
                            <div className='flex justify-center items-center h-40'>
                                <FourSquare
                                    color='#181D2A'
                                    size='medium'
                                    text=''
                                    textColor=''
                                />
                            </div>
                        ) : currentArticles.length > 0 ? (
                            <>
                                {currentArticles.map((article, index) => (
                                    <ArticleCard
                                        key={page * PAGE_SIZE + index}
                                        article={article}
                                    />
                                ))}
                                <div className='flex justify-between items-center mt-6'>
                                    <button
                                        onClick={handlePrev}
                                        disabled={page === 0}
                                        className='px-5 py-2 rounded-full text-sm font-medium bg-dark text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity'
                                    >
                                        ← Previous
                                    </button>
                                    <span className='text-gray text-sm'>
                                        Page {page + 1}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={loadingMore || isLastPage}
                                        className='px-5 py-2 rounded-full text-sm font-medium bg-dark text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity flex items-center gap-2'
                                    >
                                        {loadingMore ? (
                                            <>
                                                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block' />
                                                Loading...
                                            </>
                                        ) : (
                                            "Next →"
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className='text-gray text-sm mt-4'>
                                No news available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
