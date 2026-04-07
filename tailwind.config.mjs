/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: '68ch',
            fontFamily: 'Lora, Georgia, serif',
            lineHeight: '1.8',
            h1: { fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' },
            h2: { fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.01em' },
            h3: { fontFamily: 'Inter, system-ui, sans-serif' },
            h4: { fontFamily: 'Inter, system-ui, sans-serif' },
          },
        },
      }),
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 12px var(--glow)',
        'glow': '0 0 24px var(--glow)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
