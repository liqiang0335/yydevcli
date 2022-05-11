module.exports = {
  content: process.env.NODE_ENV == "production" ? ["./main/**/*.{html,js}", "./pages/**/*.{html,js}"] : [],
  theme: {
    extend: {},
  },
  plugins: [],
};
