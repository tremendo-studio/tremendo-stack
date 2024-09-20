import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  plugins: [require("tailwindcss-animate")],
  theme: {
    extend: {
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "shake-horizontal": "shake-horizontal 0.1s cubic-bezier(0.455, 0.030, 0.515, 0.955) both",
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
        "shake-horizontal": {
          "0%,100%": {
            transform: "translateX(0)",
          },
          "10%,30%,50%,70%": {
            transform: "translateX(-10px)",
          },
          "20%,40%,60%": {
            transform: "translateX(10px)",
          },
          "80%": {
            transform: "translateX(8px)",
          },
          "90%": {
            transform: "translateX(-8px)",
          },
        },
      },
    },
  },
} satisfies Config
