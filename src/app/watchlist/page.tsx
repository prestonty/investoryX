import Navbar from "@/components/Navbar";
import WatchlistClient from "./WatchlistClient";
import {
    getWatchlistQuotes,
    type WatchlistQuoteItem,
} from "@/lib/api";
import { cookies } from "next/headers";

export default async function WatchList() {
    // In production the API's cookies use Domain=.investoryx.ca (locally,
    // localhost), so this server sees the httpOnly access cookie and forwards it.
    // It can't refresh an expired one (the refresh cookie is scoped to the API's
    // /api/auth path); in that case the browser loads the watchlist instead.
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const hasSession = !!cookieStore.get("session_active")?.value;
    let items: WatchlistQuoteItem[] = [];
    let loadOnClient = false;

    if (accessToken) {
        try {
            items = await getWatchlistQuotes(accessToken);
        } catch (error) {
            const status = (error as { status?: number })?.status;
            if (status === 401) {
                loadOnClient = true;
            } else {
                console.error("Failed to load watchlist quotes:", error);
            }
        }
    } else if (hasSession) {
        loadOnClient = true;
    }

    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)]">
            <Navbar search={true} />

            {/* Make the search bar a component them reuse it in dashboard and watchlist (Give it an array to pass into with all possible options) */}

            {/* Display the watchlist here (make it very simple, its designed mobile first) */}

            <div className="flex-col w-2/5 mx-auto min-w-[30rem] mt-4">
                <div className="h-full bg-white rounded-[30px] shadow-dark-md px-10 py-6 flex items-center mb-6">
                    <div className="flex-col w-full px-[4%] mx-auto gap-y-10">
                        <WatchlistClient initialItems={items} loadOnClient={loadOnClient} />
                    </div>
                </div>
            </div>
        </div>
    );
}
