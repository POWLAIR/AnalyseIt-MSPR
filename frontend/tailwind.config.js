/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        'node_modules/flowbite-react/lib/esm/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#1e3a8a', // Navy blue
                },
                background: '#f8fafc',
                accent: {
                    turquoise: '#06b6d4',
                    green: '#10b981',
                },
                text: {
                    primary: '#1f2937',
                    secondary: '#4b5563',
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.2)',
                    dark: 'rgba(15, 23, 42, 0.75)',
                },
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-soft': 'linear-gradient(to right bottom, #f0f9ff, #e0f2fe, #bae6fd)',
                'gradient-blue-purple': 'linear-gradient(to right bottom, #dbeafe, #ede9fe)',
            },
            boxShadow: {
                'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'glass-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
            },
            borderColor: {
                'glass': 'rgba(255, 255, 255, 0.3)',
            },
        },
    },
    plugins: [
        require('flowbite/plugin'),
    ],
    darkMode: 'class',
};
