/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050810',
        panel: 'rgba(15, 23, 42, 0.72)',
        neon: {
          mint: '#5eead4',
          pink: '#f472b6',
          violet: '#a78bfa',
          lime: '#bef264',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(94, 234, 212, 0.25)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
