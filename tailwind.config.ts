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
          bgSecondary: "#121826",
          cardElevated: "#171D2E",
          surfaceLayer: "#1D2336",
          purple: "#7B5CFF",
          pink: "#FF4D7D",
          orange: "#FFB45C",
          lavender: "#B18CFF",
          textPrimary: "#FFFFFF",
          textSecondary: "#A3AABD",
          textMuted: "#727A90",
          divider: "rgba(255,255,255,0.08)",
        }
      },
      backgroundImage: {
        'gradient-01': 'linear-gradient(to right, #7B5CFF, #FF4D7D)',
        'gradient-02': 'linear-gradient(to right, #7B5CFF, #FF8A5B)',
        'gradient-03': 'linear-gradient(to right, #FF4D7D, #FFB45C)',
        'gradient-04': 'linear-gradient(to right, #6E7CFF, #C05CFF, #FF4D7D)',
      },
      boxShadow: {
        'soft': '0 10px 40px rgba(0,0,0,0.25)',
        'glow': '0 0 30px rgba(123,92,255,0.25)',
      },
      borderRadius: {
        'sm': '12px',
        'md': '18px',
        'lg': '24px',
        'card': '28px',
        'panel': '32px',
        'btn': '16px',
      },
      fontFamily: {
        // Points to the CSS variable we set up in layout.tsx
        sans: ['var(--font-poppins)', 'SF Pro Display', 'sans-serif'],
      },
      transitionTimingFunction: {
        'smooth': 'ease-out',
      },
      transitionDuration: {
        'base': '250ms',
        'slow': '500ms',
      }
    },
  },
  plugins: [],
};

export default config;