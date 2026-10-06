import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true, // Adhere to good practice to learn standards better
    images: {
        remotePatterns: [{ protocol: "https", hostname: "cdn.snapi.dev" }],
    },
};

export default nextConfig;
