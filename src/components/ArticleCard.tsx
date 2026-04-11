import Image from "next/image";
import { Article } from "@/types/article";

export default function ArticleCard({ article }: { article: Article }) {
    return (
        <a href={article.url} target="_blank" rel="noopener noreferrer">
            <div className="flex gap-4 py-4 border-b border-light last:border-b-0 last:pb-0 hover:opacity-80 transition-opacity">
                <Image
                    src={article.image}
                    width={160}
                    height={105}
                    className="w-[160px] h-[105px] object-cover rounded-xl flex-shrink-0"
                    alt="article thumbnail"
                />
                <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                        <p className="text-dark font-bold text-[1.05rem] leading-snug mb-1">
                            {article.headline}
                        </p>
                        <p className="text-gray text-sm">{article.source}</p>
                        {article.tickers?.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-2">
                                {article.tickers.map((ticker) => (
                                    <span
                                        key={ticker}
                                        className="bg-[#F0F2FF] text-blue text-xs font-bold px-2.5 py-0.5 rounded-full"
                                    >
                                        {ticker}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-gray text-xs mt-2">{article.datetime}</p>
                </div>
            </div>
        </a>
    );
}
