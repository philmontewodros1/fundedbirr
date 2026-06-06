import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fff9e6',
          100: '#fef0b3',
          200: '#fde680',
          300: '#fcdd4d',
          400: '#fbd31a',
          500: '#e6b800',
          600: '#b89400',
          700: '#8a7000',
          800: '#5c4b00',
          900: '#2e2500',
        },
        ethiopia: {
          green: '#1a8c3a',
          yellow: '#fcdd4d',
          red: '#d42d2d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
