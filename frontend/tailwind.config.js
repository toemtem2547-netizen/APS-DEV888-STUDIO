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
        game: {
          dark: '#07090D',
          surface: '#0D1117',
          elevated: '#121821',
          card: '#161D29',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.2)',
          accent: 'var(--primary-accent, #6366F1)',
          gold: '#F59E0B',
          mythic: '#EC4899',
          epic: '#A855F7',
          rare: '#3B82F6',
          common: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 25px -5px var(--primary-accent-glow, rgba(99, 102, 241, 0.3))',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-mythic': '0 0 30px -5px rgba(236, 72, 153, 0.45)',
        'glow-epic': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'glow-rose': '0 0 30px -5px rgba(244, 63, 94, 0.45)',
        'glow-violet': '0 0 30px -5px rgba(139, 92, 246, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-cosmic': '0 0 40px 0px rgba(168, 85, 247, 0.5), 0 0 80px 0px rgba(244, 63, 94, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'cosmic-pulse': 'cosmicPulse 2s ease-in-out infinite',
        'neon-border-spin': 'neonBorderSpin 3s linear infinite',
        'winner-bounce': 'winnerBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'winner-glow': 'winnerGlow 1.5s ease-in-out infinite',
        'reveal-scale': 'revealScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        cosmicPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 60px rgba(244, 63, 94, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.7), 0 0 100px rgba(244, 63, 94, 0.3)' },
        },
        neonBorderSpin: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        winnerBounce: {
          '0%': { transform: 'scale(0.85)', opacity: '0.5' },
          '40%': { transform: 'scale(1.2)' },
          '70%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1.08)', opacity: '1' },
        },
        winnerGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)' },
          '50%': { boxShadow: '0 0 45px rgba(245, 158, 11, 0.8), 0 0 90px rgba(245, 158, 11, 0.35), inset 0 0 20px rgba(255, 215, 0, 0.15)' },
        },
        revealScale: {
          '0%': { transform: 'scale(0.5) rotateY(90deg)', opacity: '0' },
          '50%': { transform: 'scale(1.12) rotateY(-8deg)', opacity: '1' },
          '80%': { transform: 'scale(0.98) rotateY(3deg)' },
          '100%': { transform: 'scale(1) rotateY(0deg)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
