const isDEV = process.env.NODE_ENV === "development";

module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    isDEV && require.resolve("react-refresh/babel"),
  ],
};
