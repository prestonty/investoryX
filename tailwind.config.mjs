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
            boxShadow: {
                'dark-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
                'dark-md': '0 4px 6px rgba(20, 20, 20, 0.3)',
                'dark-lg': '0 10px 15px rgba(0, 0, 0, 0.3)',
                'dark-xl': '0 20px 25px rgba(0, 0, 0, 0.4)',
              },
        },
    },
    plugins: [],
};
