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
        // Colores principales
        'primary': '#0a7ea4',
        'primary-dark': '#086d8f',
        'secondary': '#f5f5f5',
        'danger': '#ff3b30',
        'validate': '#ff3b30',
        'warning': '#ff9500',
        'success': '#34c759',
        'info': '#5ac8fa',
        
        // Colores de estado
        'pending': '#ff9500',
        'approved': '#34c759',
        'rejected': '#ff3b30',
        'inProgress': '#0a7ea4',
        
        // Colores de texto y fondo (modo claro)
        'text': '#11181C',
        'background': '#fff',
        'icon': '#687076',
        'sectionBackground': '#f5f5f5',
        
        // Colores de texto y fondo (modo oscuro)
        'dark-text': '#ECEDEE',
        'dark-background': '#151718',
        'dark-icon': '#9BA1A6',
        'dark-sectionBackground': '#222222',
        'dark-secondary': '#333333',
      },
    },
  },
  plugins: [],
}
