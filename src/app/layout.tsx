import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import Cursor from "@/components/Cursor";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "InvestoryX",
    description: "FinTech Stock Analytics App",
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
                {/* <Cursor /> */}
                {children}
            </body>
        </html>
    );
}
