const path = require("path");

module.exports = {
    entry: "./scripts/index",

    output: {
        path: path.resolve("./build"),
        filename: "bundle.js",
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-transform-runtime'],
                }
            }
        }]
    },
}