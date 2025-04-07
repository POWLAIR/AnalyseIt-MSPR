import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/lib/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7dccfd',
          400: '#48b5f9',
          500: '#1e9cf1',
          600: '#0a7fd4',
          700: '#0965ab',
          800: '#0d548d',
          900: '#0f4975',
          950: '#0a2e4e',
        },
        accent: {
          turquoise: '#2dd4bf',
          green: '#22c55e', 
          blue: '#3b82f6',
          purple: '#a855f7',
        },
        text: {
          primary: 'rgb(var(--foreground-rgb))',
          inverse: 'rgb(var(--background-rgb))',
        },
        glass: {
          DEFAULT: 'rgba(var(--glass-border-light))',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      boxShadow: {
        glass: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-blue-purple': 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(224, 231, 255))',
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};

export default config;
