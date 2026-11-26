/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dunkirk: {
          dark: '#07162C',
          darker: '#040E1C',
          navy: '#0B2244',
          navyLight: '#113366',
          gold: '#DDA727',
          goldBright: '#F5C64B',
          goldHover: '#C6931E',
          card: '#0D2140',
          border: '#1A365D'
        }
      },
      boxShadow: {
        'gold-glow': '0 0 20px -3px rgba(221, 167, 39, 0.35)',
        'gold-glow-lg': '0 0 30px -5px rgba(221, 167, 39, 0.55)',
        'navy-glow': '0 10px 30px -5px rgba(11, 34, 68, 0.8)',
      }
    },
  },
  plugins: [],
}
