/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tusai-blue': '#2563eb', // primary blue
        'tusai-purple': '#6d28d9', // deep purple
        'tusai-teal': '#10b981', // accent teal
        'tusai-dark': '#18181b', // dark bg
        'tusai-light': '#f8fafc', // light bg
        'tusai-accent': '#a18aff', // accent purple
        'tusai-error': '#ef4444', // red
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
      },
    },
  },
  plugins: [],
}; 