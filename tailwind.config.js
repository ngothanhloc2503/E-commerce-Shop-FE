/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/index.html",                
    "./src/**/*.{html,ts,js,jsx,tsx}",     
    "./node_modules/flowbite/**/*.js"      
  ],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
      },
      width: {
        '128': '32rem',
      },
      height: {
        '128': '32rem',
      },
      aspectRatio: {
        '4/3': '4 / 3',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
    }),
  ]
}

