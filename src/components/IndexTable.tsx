"use client";

import { useState, useMemo } from "react";

interface Etf {
    ticker: string;
    name: string;
    price?: string;
    priceChange?: string;
    priceChangePercent?: string;
}

interface EtfCategory {
    title: string;
    etfs: Etf[];
}

interface FlatRow extends Etf {
    category: string;
}

const ROWS_PER_PAGE = 8;

function changeColor(value?: string) {
    const n = Number(value);
    if (n > 0) return "text-green";
    if (n < 0) return "text-red";
    return "text-gray";
}

// Assign a consistent badge style per category index
const BADGE_STYLES = [
    "bg-[#EEF1FF] text-blue",
    "bg-[#FFF3E0] text-[#E07A00]",
    "bg-[#E8F5E9] text-green",
    "bg-[#FCE4EC] text-[#C62828]",
    "bg-[#F3E5F5] text-[#7B1FA2]",
];

export default function IndexTable({ data }: { data: EtfCategory[] }) {
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
        new Set(),
    );
    const [page, setPage] = useState(1);

    const categories = useMemo(
        () => data.map((cat) => cat.title),
        [data],
    );

    const categoryBadgeStyle = useMemo(() => {
        const map: Record<string, string> = {};
        categories.forEach((cat, i) => {
            map[cat] = BADGE_STYLES[i % BADGE_STYLES.length];
        });
        return map;
    }, [categories]);

    const flatRows: FlatRow[] = useMemo(
        () =>
            data.flatMap((cat) =>
                cat.etfs.map((etf) => ({ ...etf, category: cat.title })),
            ),
        [data],
    );

    const filtered = useMemo(
        () =>
            selectedCategories.size === 0
                ? flatRows
                : flatRows.filter((r) => selectedCategories.has(r.category)),
        [flatRows, selectedCategories],
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const pageRows = filtered.slice(
        (page - 1) * ROWS_PER_PAGE,
        page * ROWS_PER_PAGE,
    );

    function toggleCategory(cat: string) {
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) {
                next.delete(cat);
            } else {
                next.add(cat);
            }
            return next;
        });
        setPage(1);
    }

    function clearFilter() {
        setSelectedCategories(new Set());
        setPage(1);
    }

    return (
        <div>
            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap mb-5">
                <button
                    onClick={clearFilter}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        selectedCategories.size === 0
                            ? "bg-blue text-white border-blue"
                            : "bg-white text-dark border-[#D0D3DA] hover:border-blue hover:text-blue"
                    }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                            selectedCategories.has(cat)
                                ? "bg-blue text-white border-blue"
                                : "bg-white text-dark border-[#D0D3DA] hover:border-blue hover:text-blue"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-[#F5F6FA] border-b-2 border-[#E0E3EA]">
                        <th className="text-left px-4 py-2.5 text-gray font-bold text-xs uppercase tracking-wide">
                            Category
                        </th>
                        <th className="text-left px-4 py-2.5 text-gray font-bold text-xs uppercase tracking-wide">
                            Name (Ticker)
                        </th>
                        <th className="text-right px-4 py-2.5 text-gray font-bold text-xs uppercase tracking-wide">
                            Price
                        </th>
                        <th className="text-right px-4 py-2.5 text-gray font-bold text-xs uppercase tracking-wide">
                            Change ($)
                        </th>
                        <th className="text-right px-4 py-2.5 text-gray font-bold text-xs uppercase tracking-wide">
                            Change (%)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map((row, i) => (
                        <tr
                            key={`${row.ticker}-${i}`}
                            className={`border-b border-[#F0F2F5] ${
                                i % 2 === 0 ? "bg-white" : "bg-[#FAFBFD]"
                            }`}
                        >
                            <td className="px-4 py-3">
                                <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        categoryBadgeStyle[row.category]
                                    }`}
                                >
                                    {row.category}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-dark">
                                {row.name}{" "}
                                <span className="text-gray font-normal text-[0.85em]">
                                    ({row.ticker})
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right text-dark">
                                {row.price != null ? `$${row.price}` : "—"}
                            </td>
                            <td
                                className={`px-4 py-3 text-right font-medium ${changeColor(row.priceChange)}`}
                            >
                                {row.priceChange != null
                                    ? `${Number(row.priceChange) >= 0 ? "+" : ""}$${row.priceChange}`
                                    : "—"}
                            </td>
                            <td
                                className={`px-4 py-3 text-right font-medium ${changeColor(row.priceChangePercent)}`}
                            >
                                {row.priceChangePercent != null
                                    ? `${Number(row.priceChangePercent) >= 0 ? "+" : ""}${row.priceChangePercent}%`
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-5">
                <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="px-4 py-1.5 rounded-lg border border-[#D0D3DA] bg-white text-dark text-sm font-semibold disabled:text-[#C0C4CC] disabled:border-[#E0E3EA] disabled:cursor-not-allowed hover:enabled:bg-blue hover:enabled:text-white hover:enabled:border-blue transition-colors"
                >
                    ← Prev
                </button>
                <span className="text-gray text-sm font-semibold min-w-[110px] text-center">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-1.5 rounded-lg border border-[#D0D3DA] bg-white text-dark text-sm font-semibold disabled:text-[#C0C4CC] disabled:border-[#E0E3EA] disabled:cursor-not-allowed hover:enabled:bg-blue hover:enabled:text-white hover:enabled:border-blue transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
