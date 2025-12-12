import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#050509',
        'dark-surface': '#12131B',
        'dark-elevated': '#151621',
        'gold-primary': '#E4C27A',
        'gold-secondary': '#C9A965',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A0A3B1',
        'border-subtle': '#262837',
        'success': '#4ADE80',
        'error': '#F97373'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

