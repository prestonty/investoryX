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

const ROWS_PER_PAGE = 10;

type SortKey =
    | "category"
    | "name"
    | "price"
    | "priceChange"
    | "priceChangePercent";
type SortDir = "asc" | "desc";

function compareRows(
    a: FlatRow,
    b: FlatRow,
    key: SortKey,
    dir: SortDir,
): number {
    let av: string | number | undefined;
    let bv: string | number | undefined;

    if (key === "category" || key === "name") {
        av = key === "category" ? a.category : a.name;
        bv = key === "category" ? b.category : b.name;
        const cmp = (av ?? "").localeCompare(bv ?? "");
        return dir === "asc" ? cmp : -cmp;
    } else {
        av = Number(a[key] ?? NaN);
        bv = Number(b[key] ?? NaN);
        const aNaN = isNaN(av as number);
        const bNaN = isNaN(bv as number);
        if (aNaN && bNaN) return 0;
        if (aNaN) return 1;
        if (bNaN) return -1;
        const cmp = (av as number) - (bv as number);
        return dir === "asc" ? cmp : -cmp;
    }
}

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
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const categories = useMemo(() => data.map((cat) => cat.title), [data]);

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

    const sorted = useMemo(
        () =>
            sortKey
                ? [...filtered].sort((a, b) =>
                      compareRows(a, b, sortKey, sortDir),
                  )
                : filtered,
        [filtered, sortKey, sortDir],
    );

    const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
    const pageRows = sorted.slice(
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

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setPage(1);
    }

    function clearFilter() {
        setSelectedCategories(new Set());
        setPage(1);
    }

    return (
        <div>
            {/* Category filter pills */}
            <div className='flex gap-2 flex-wrap mb-5'>
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
            <table className='w-full border-collapse text-sm'>
                <thead>
                    <tr className='bg-[#F5F6FA] border-b-2 border-[#E0E3EA]'>
                        {(
                            [
                                {
                                    key: "category",
                                    label: "Category",
                                    align: "left",
                                },
                                {
                                    key: "name",
                                    label: "Name (Ticker)",
                                    align: "left",
                                },
                                {
                                    key: "price",
                                    label: "Price",
                                    align: "right",
                                },
                                {
                                    key: "priceChange",
                                    label: "Change ($)",
                                    align: "right",
                                },
                                {
                                    key: "priceChangePercent",
                                    label: "Change (%)",
                                    align: "right",
                                },
                            ] as {
                                key: SortKey;
                                label: string;
                                align: "left" | "right";
                            }[]
                        ).map(({ key, label, align }) => (
                            <th
                                key={key}
                                onClick={() => handleSort(key)}
                                className={`px-4 py-2.5 text-gray font-bold text-xs uppercase tracking-wide cursor-pointer select-none hover:text-blue transition-colors text-${align}`}
                            >
                                {label}
                                <span className='ml-1 inline-block w-3'>
                                    {sortKey === key ? (
                                        sortDir === "asc" ? (
                                            "↑"
                                        ) : (
                                            "↓"
                                        )
                                    ) : (
                                        <span className='opacity-30'>↕</span>
                                    )}
                                </span>
                            </th>
                        ))}
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
                            <td className='px-4 py-3'>
                                <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        categoryBadgeStyle[row.category]
                                    }`}
                                >
                                    {row.category}
                                </span>
                            </td>
                            <td className='px-4 py-3 font-semibold text-dark'>
                                {row.name}{" "}
                                <span className='text-gray font-normal text-[0.85em]'>
                                    ({row.ticker})
                                </span>
                            </td>
                            <td className='px-4 py-3 text-right text-dark'>
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
            <div className='flex justify-center items-center gap-3 mt-5'>
                <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className='px-4 py-1.5 rounded-lg border border-[#D0D3DA] bg-white text-dark text-sm font-semibold disabled:text-[#C0C4CC] disabled:border-[#E0E3EA] disabled:cursor-not-allowed hover:enabled:bg-blue hover:enabled:text-white hover:enabled:border-blue transition-colors'
                >
                    ← Prev
                </button>
                <span className='text-gray text-sm font-semibold min-w-[110px] text-center'>
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className='px-4 py-1.5 rounded-lg border border-[#D0D3DA] bg-white text-dark text-sm font-semibold disabled:text-[#C0C4CC] disabled:border-[#E0E3EA] disabled:cursor-not-allowed hover:enabled:bg-blue hover:enabled:text-white hover:enabled:border-blue transition-colors'
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
