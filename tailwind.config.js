/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#F59E0B',
        accent: '#10B981',
        muted: '#E2E8F0',
        background: '#F8FAFC',
        foreground: '#0F172A',
      },
    },
  },
  plugins: [],
}