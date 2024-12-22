/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: "#181D2A",
                gray: "#7E8391",
                light: "#E8EBED",
                blue: "#748EFE",

                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            gridTemplateColumns: {
                "12-5": "12fr 5fr",
            },
        },
    },
    plugins: [],
};
