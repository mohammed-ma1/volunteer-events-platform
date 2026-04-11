/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0b1221',
        },
        ink: {
          50: '#f4f6fb',
          100: '#e8ecf6',
          200: '#c9d2e8',
          300: '#9aa8cc',
          400: '#6a7899',
          500: '#4a5670',
          600: '#323a4d',
          700: '#252b3a',
          800: '#161a24',
          900: '#0c0e14',
        },
        coral: {
          400: '#ff8a7a',
          500: '#ff6b5b',
          600: '#e85545',
        },
        mint: {
          400: '#5fe4c4',
          500: '#2ed3a6',
          600: '#1fb88e',
        },
      },
      fontFamily: {
        /** Latin first for EN; Cairo provides Arabic glyphs. */
        sans: ['"Plus Jakarta Sans"', 'Cairo', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Cairo', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        veFadeUp: {
          from: { opacity: '0', transform: 'translateY(0.85rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        veFadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        veFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        veBlob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(8%, -6%) scale(1.06)' },
          '66%': { transform: 'translate(-6%, 4%) scale(0.96)' },
        },
        veAddedPop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        veAddedCheck: {
          '0%': { transform: 'scale(0.5) rotate(-45deg)', opacity: '0' },
          '55%': { transform: 'scale(1.15) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        veSuccessPop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '55%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        veSuccessCheck: {
          '0%': { transform: 'scale(0.4) rotate(-12deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        veCtaRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29, 78, 216, 0.42)' },
          '55%': { boxShadow: '0 0 0 14px rgba(29, 78, 216, 0)' },
        },
        veFloatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        veShimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        've-fade-up': 'veFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        've-fade-in': 'veFadeIn 0.5s ease-out both',
        've-float': 'veFloat 5.5s ease-in-out infinite',
        've-blob': 'veBlob 22s ease-in-out infinite',
        've-added-pop': 'veAddedPop 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) both',
        've-added-check': 'veAddedCheck 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both',
        've-success-pop': 'veSuccessPop 0.55s cubic-bezier(0.34, 1.2, 0.64, 1) both',
        've-success-check': 'veSuccessCheck 0.5s ease-out 0.12s both',
        've-cta-ring': 'veCtaRing 2.75s ease-out infinite',
        've-float-slow': 'veFloatSlow 6s ease-in-out infinite',
        've-shimmer': 'veShimmer 2.4s linear infinite',
      },
      boxShadow: {
        lift: '0 18px 50px -24px rgba(12, 14, 20, 0.45)',
        soft: '0 10px 40px -20px rgba(22, 26, 36, 0.35)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(1200px circle at 10% -10%, rgba(255,107,91,0.35), transparent 55%), radial-gradient(900px circle at 90% 10%, rgba(46,211,166,0.28), transparent 50%), radial-gradient(800px circle at 50% 100%, rgba(154,168,204,0.2), transparent 45%)',
      },
    },
  },
  plugins: [],
};
