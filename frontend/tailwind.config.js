/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDF9EF',
          100: '#F9EFD3',
          200: '#F2DFA7',
          300: '#EBCF7B',
          400: '#D4AF37',
          500: '#B8962E',
          600: '#8C7324',
          700: '#604F19',
          800: '#342B0F',
          900: '#080500'
        },
        navy: {
          50: '#E8ECF0',
          100: '#C5CED9',
          200: '#9FAFBF',
          300: '#7990A6',
          400: '#53718D',
          500: '#2C3E50',
          600: '#233140',
          700: '#1A242F',
          800: '#11171F',
          900: '#080B0F'
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
