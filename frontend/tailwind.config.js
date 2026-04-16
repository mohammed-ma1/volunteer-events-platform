/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        /** NEXT LEVELS: brand purple (screenshot ~#2E2A7B) — primary text, CTAs, banner. */
        brand: {
          50: '#f5f4fc',
          100: '#ebe9f7',
          200: '#d8d4ef',
          300: '#b8b2e0',
          400: '#9288cc',
          500: '#7268b8',
          600: '#5d55a5',
          700: '#4d4594',
          800: '#3f3a86',
          900: '#2E2A7B',
          950: '#232059',
        },
        /** Metallic / mustard gold — logo + hero highlights + nav underline */
        gold: {
          400: '#f0d78c',
          500: '#d4af37',
          600: '#b8922a',
          700: '#9a7828',
        },
        /** Violet / indigo — newsletter, secondary accents */
        accent: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
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
        sans: ['Tajawal', 'sans-serif'],
        display: ['Tajawal', 'sans-serif'],
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 42, 123, 0.42)' },
          '55%': { boxShadow: '0 0 0 14px rgba(46, 42, 123, 0)' },
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
          'radial-gradient(1200px circle at 10% -10%, rgba(212,175,55,0.18), transparent 55%), radial-gradient(900px circle at 90% 10%, rgba(99,102,241,0.12), transparent 50%), radial-gradient(800px circle at 50% 100%, rgba(26,31,54,0.08), transparent 45%)',
      },
    },
  },
  plugins: [],
};
