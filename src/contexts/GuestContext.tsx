"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface GuestContextValue {
    isGuest: boolean;
}

const GuestContext = createContext<GuestContextValue>({ isGuest: false });

export function GuestProvider({ children }: { children: React.ReactNode }) {
    const [isGuest, setIsGuest] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsGuest(!isAuthenticated());
    }, [pathname]);

    return (
        <GuestContext.Provider value={{ isGuest }}>
            {children}
        </GuestContext.Provider>
    );
}

export function useGuest(): GuestContextValue {
    return useContext(GuestContext);
}
