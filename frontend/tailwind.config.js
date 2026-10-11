/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fira Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace'], // cifras y datos técnicos
      },
      colors: {
        // Acento del sistema de diseño (uso puntual: foco, indicadores activos)
        accent: { DEFAULT: '#059669', dark: '#047857' },
      },
    },
  },
  plugins: [],
}
