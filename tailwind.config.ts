import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        melora: {
          bgPrimary: "#0B0F16",
          bgSecondary: "#0F1420",
          bgTertiary: "#121826",
          cardElevated: "#171D2E",
          cardSurface: "#1C2335",
          surfaceLayer: "#1C2335",
          surfaceHover: "#222A3F",
          modalBg: "#151B29",
          
          textPrimary: "#FFFFFF",
          textSecondary: "#A3AABD",
          textMuted: "#747C91",
          textDisabled: "#50576A",

          purple: "#7B5CFF",
          pink: "#FF4D7D",
          orange: "#FFB45C",
          lavender: "#B18CFF",
          rose: "#FF8EAA",

          success: "#4ADE9A",
          warning: "#FFB45C",
          error: "#FF5C72",
          info: "#6E8CFF",

          divider: "rgba(255,255,255,0.06)",
          dividerHover: "rgba(255,255,255,0.12)",
          dividerActive: "rgba(123,92,255,0.45)",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7B5CFF 0%, #FF4D7D 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF4D7D 0%, #FFB45C 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #6E7CFF 0%, #B18CFF 50%, #FF4D7D 100%)',
        'gradient-purple-glow': 'linear-gradient(135deg, #5C42D9 0%, #9C7BFF 100%)',
        'gradient-warm-glow': 'linear-gradient(135deg, #FF6B7A 0%, #FFB45C 100%)',
        'gradient-atmospheric': 'linear-gradient(180deg, #0B0F16 0%, #151027 50%, #24132B 100%)',
        // Backward compatibility:
        'gradient-01': 'linear-gradient(135deg, #7B5CFF 0%, #FF4D7D 100%)',
        'gradient-02': 'linear-gradient(135deg, #7B5CFF 0%, #FF8A5B 100%)',
        'gradient-03': 'linear-gradient(135deg, #FF4D7D 0%, #FFB45C 100%)',
        'gradient-04': 'linear-gradient(135deg, #6E7CFF 0%, #C05CFF 50%, #FF4D7D 100%)',
      },
      boxShadow: {
        'soft-sm': '0 4px 16px rgba(0,0,0,0.18)',
        'soft-md': '0 10px 30px rgba(0,0,0,0.25)',
        'soft-lg': '0 20px 60px rgba(0,0,0,0.35)',
        'soft': '0 10px 30px rgba(0,0,0,0.25)',
        'glow': '0 0 35px rgba(123,92,255,0.25)',
        'glow-purple': '0 0 35px rgba(123,92,255,0.25)',
        'glow-pink': '0 0 35px rgba(255,77,125,0.22)',
        'glow-orange': '0 0 35px rgba(255,180,92,0.20)',
        'glow-ambient': '0 0 50px rgba(123,92,255,0.15)',
      },
      borderRadius: {
        'xs': '10px',
        'sm': '12px',
        'btn': '14px',
        'input': '16px',
        'md': '18px',
        'card': '20px',
        'card-lg': '24px',
        'feature': '28px',
        'player': '28px',
        'panel': '32px',
        'hero': '32px',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-custom': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        'micro': '200ms',
        'base': '300ms',
        'slow': '500ms',
        'cinematic': '800ms',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(20px, -20px) scale(1.05)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};

export default config;