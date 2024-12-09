const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");
require("dotenv").config({ path: "./.env.prod" });
console.log(process.env.S3_BUCKET);
module.exports = merge(commonConfig, {
  mode: "production",
});
