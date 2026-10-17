/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Quicksand', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      colors: {
        droplet: {
          50: '#EFF9FF',
          200: '#B9E4FA',
          400: '#5AB6E0',
          600: '#2C7FB0',
        },
        leaf: {
          300: '#A7E0A1',
          500: '#4FB477',
          700: '#2E7D5B',
        },
        sun: {
          200: '#FFE9B8',
          400: '#FFC97A',
        },
      },
      boxShadow: {
        glass: '0 18px 40px -18px rgb(11 25 48 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.35)',
        'glass-inset': 'inset 0 1px 0 rgb(255 255 255 / 0.45)',
      },
      borderRadius: {
        blob: '2rem 2rem 2.25rem 2.25rem',
      },
    },
  },
  plugins: [],
}
