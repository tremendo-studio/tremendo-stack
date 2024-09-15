import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  plugins: [require("tailwindcss-animate")],
  theme: {
    extend: {
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
    },
  },
} satisfies Config
