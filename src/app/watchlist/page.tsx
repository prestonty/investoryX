import Navbar from "@/components/Navbar";
import WatchlistClient from "./WatchlistClient";
import {
    getWatchlistQuotes,
    type WatchlistQuoteItem,
} from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function WatchList() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    let items: WatchlistQuoteItem[] = [];
    let authFailed = false;

    if (accessToken) {
        try {
            items = await getWatchlistQuotes(accessToken);
        } catch (error) {
            const status = (error as { status?: number })?.status;
            const shouldRefresh = status === 401 && !!refreshToken;

            if (!shouldRefresh) {
                console.error("Failed to load watchlist quotes:", error);
            } else {
                try {
                    const refreshRes = await fetch(
                        `${process.env.NEXT_PUBLIC_URL}/api/auth/refresh`,
                        {
                            method: "POST",
                            headers: {
                                Cookie: `refresh_token=${refreshToken}`,
                            },
                            cache: "no-store",
                        },
                    );

                    if (!refreshRes.ok) {
                        authFailed = true;
                    } else {
                        const refreshData = (await refreshRes.json()) as {
                            access_token?: string;
                        };
                        if (refreshData.access_token) {
                            try {
                                items = await getWatchlistQuotes(
                                    refreshData.access_token,
                                );
                            } catch (retryError) {
                                const retryStatus = (
                                    retryError as { status?: number }
                                )?.status;
                                if (retryStatus === 401) {
                                    authFailed = true;
                                } else {
                                    console.error(
                                        "Failed to load watchlist quotes:",
                                        retryError,
                                    );
                                }
                            }
                        } else {
                            authFailed = true;
                        }
                    }
                } catch (refreshError) {
                    authFailed = true;
                }
            }
        }
    }

    if (authFailed) {
        redirect("/login?redirectTo=/watchlist");
    }

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)]">
            <Navbar search={true} />

            {/* Make the search bar a component them reuse it in dashboard and watchlist (Give it an array to pass into with all possible options) */}

            {/* Display the watchlist here (make it very simple, its designed mobile first) */}

            <div className="flex-col w-2/5 mx-auto min-w-[30rem]">
                <div className="h-full bg-white rounded-[30px] shadow-dark-md px-10 py-6 flex items-center mb-6">
                    <div className="flex-col w-full px-[4%] mx-auto gap-y-10">
                        <WatchlistClient initialItems={items} />
                    </div>
                </div>
            </div>
        </div>
    );
}
