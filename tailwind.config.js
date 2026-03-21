/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — all backed by CSS variables
        bg: "var(--bg)",
        app: "var(--bg)", // legacy alias
        surface: "var(--surface)",
        card: "var(--surface)", // legacy alias
        "surface-2": "var(--surface-2)",
        accent: "var(--accent)",
        "accent-warm": "var(--accent-warm)",
        primary: "var(--text-primary)",
        muted: "var(--text-muted)",
        hint: "var(--text-hint)",
        success: "var(--success)",
        border: "var(--border)",
        "badge-bg": "var(--badge-bg)",
      },
      fontFamily: {
        playfair: ['"Playfair Display"', "serif"],
        dm: ['"DM Sans"', "sans-serif"],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
      },
    },
  },
  plugins: [],
};
