/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f2f4f7',
          100: '#e1e6ed',
          200: '#c3ccd9',
          300: '#98a6bb',
          400: '#6d7f99',
          500: '#4b5f7b',
          600: '#364960',
          700: '#263648',
          800: '#19263a',
          900: '#111b2b',
          950: '#0a121e',
        },
        // Warm paper neutrals — the only non-green surface colours.
        cream: {
          50: '#faf7f1',
          100: '#f3eee3',
          200: '#e8e1d1',
          300: '#d5ccb7',
        },
        // The single accent: muted brass.
        brass: {
          300: '#d9bf91',
          400: '#c9a56a',
          500: '#b58d4e',
          600: '#9a7336',
          700: '#7d5a26',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '2px' },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      animation: {
        'accordion-down': 'accordionDown 0.3s cubic-bezier(0.22,1,0.36,1)',
        'accordion-up': 'accordionUp 0.25s cubic-bezier(0.22,1,0.36,1)',
        marquee: 'marquee 48s linear infinite',
      },
      keyframes: {
        accordionDown: { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        accordionUp: { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
