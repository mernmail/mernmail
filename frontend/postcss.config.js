export default {
  plugins: {
    tailwindcss: {},
    "./postcss/transform-pseudoclass.js": {},
    "@csstools/postcss-is-pseudo-class": {
      preserve: true
    },
    autoprefixer: {},
    "postcss-css-variables": {
      preserve: true
    }
  },
}
