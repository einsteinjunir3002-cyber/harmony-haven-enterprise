import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Harmony Haven Corporate Colors
        harmony: {
          50: '#f0f9f9',
          100: '#d8f0f0',
          200: '#b4e2e2',
          300: '#82cdcd',
          400: '#48b0b1',
          500: '#2d9496',
          600: '#217679',
          700: '#1e5f62',
          800: '#1b4d4f',
          900: '#0a4d52',
          950: '#062d31',
        },
        // Gold Accents
        gold: {
          50: '#fbf8ea',
          100: '#f5efc7',
          200: '#ebde91',
          300: '#dec756',
          400: '#d4af37',
          500: '#c59b27',
          600: '#a97a1d',
          700: '#87581a',
          800: '#71461c',
          900: '#613c1c',
        },
        // Kowah's Dishes Warm Wooden Brown Colors
        kowah: {
          50: '#fbf7f3',
          100: '#f6ece2',
          200: '#ebd7c2',
          300: '#dcbb9a',
          400: '#ca9b70',
          500: '#be8150',
          600: '#b06b43',
          700: '#925439',
          800: '#774533',
          900: '#4a2818',
          950: '#2b150c',
        },
        // 4U HEARTLINES Poetic Teal / Rose / Velvet
        heartlines: {
          50: '#f2fbfb',
          100: '#def5f5',
          200: '#c1ebec',
          300: '#95dbde',
          400: '#5fc2c7',
          500: '#38a3ab',
          600: '#2c838c',
          700: '#276971',
          800: '#25565d',
          900: '#14464c',
          rose: '#e5859e',
          velvet: '#722f47',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'luxury': '0 10px 30px -5px rgba(10, 77, 82, 0.1)',
        'warm': '0 10px 30px -5px rgba(74, 40, 24, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
