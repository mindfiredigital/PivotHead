// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//     "./docs/**/*.{md,mdx}",
//     "./blog/**/*.{md,mdx}",
//     "./static/**/*.{html,js}",
//   ],

//   theme: {
//     extend: {
//       animation: {
//         'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
//         'fade-in-up-delay': 'fadeInUp 0.6s ease-out 0.2s both',
//         'fade-in-up-delay-2': 'fadeInUp 0.6s ease-out 0.4s both',
//       },
//       keyframes: {
//         fadeInUp: {
//           '0%': {
//             opacity: '0',
//             transform: 'translateY(30px)',
//           },
//           '100%': {
//             opacity: '1',
//             transform: 'translateY(0)',
//           },
//         },
//       },
//     },
//   },
//   plugins: [],
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}',
    './blog/**/*.{md,mdx}',
    './static/**/*.{html,js}',
  ],

  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.6s ease-out 0.2s both',
        'fade-in-up-delay-2': 'fadeInUp 0.6s ease-out 0.4s both',
        'slide-in-from-left': 'slideInFromLeft 0.8s ease-out forwards',
        'slide-in-from-right': 'slideInFromRight 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
