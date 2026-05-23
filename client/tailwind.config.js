/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090D16',      // Main page background
          sidebar: '#0D1321', // Sidebar background
          card: '#131B2E',    // Order cards & panel backgrounds
          border: '#1F293D',  // Soft slate borders
          text: '#F3F4F6',    // High contrast off-white text
          muted: '#9CA3AF',   // Muted gray labels
          input: '#1A233D'    // Active chat inputs
        },
        light: {
          bg: '#F9FAFB',
          sidebar: '#F3F4F6',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#111827',
          muted: '#6B7280',
          input: '#F3F4F6'
        },
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#10B981',
          orange: '#F59E0B',
          gray: '#6B7280'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
