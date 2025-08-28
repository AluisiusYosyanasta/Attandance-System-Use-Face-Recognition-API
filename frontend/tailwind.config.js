/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        "Montserrat" : ["Montserrat", 'sans-serif']
      },
      colors: {
        color1: 'hsl(207, 73%, 17%)',
        color2: 'hsl(207, 73%, 27%)',
        color3: 'hsl(207, 73%, 37%)',
        color4: 'hsl(207, 73%, 47%)',
        color5: 'hsl(207, 73%, 57%)',
        color6: 'hsl(207, 73%, 67%)',
        color7: 'hsl(207, 73%, 77%)',
        color8: 'hsl(207, 73%, 87%)',
        color9: 'hsl(207, 73%, 97%)',
        color10: 'hsl(207, 73%, 100%)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 10s linear infinite',
      },
    },
  },
  plugins: [],
}

