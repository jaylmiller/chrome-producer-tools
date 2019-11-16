module.exports = {
	entry: {
		index: __dirname + "/src/index.js"
	},
	output: {
		path: __dirname + "/dist",
		publicPath: "/dist/",
		filename: "[name].js",
		sourceMapFilename: "[name].map.js"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
						plugins: ["@babel/plugin-transform-runtime"]
					}
				}
			}
		]
	}
};
