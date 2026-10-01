import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FAFAF7",
        paperShade: "#F3F2ED",
        rose: {
          DEFAULT: "#9F1239",
          dim: "#881337",
          soft: "#FCE7EC",
        },
        line: "#E5E3DC",
        muted: "#6B6B66",
      },
      fontFamily: {
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
