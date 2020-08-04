module.exports = ({ config }) => {
  config.stats = "errors-only";

  config.module.rules = [
    {
      test: /\.css$/,
      exclude: /\.module.(css)$/,
      loader: ["style-loader", "css-loader"],
    },
    {
      test: /\.(ts|tsx)$/,
      loader: require.resolve("babel-loader"),
      options: {
        presets: ["@babel/preset-react", "@babel/preset-typescript"],
      },
    },
    {
      test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: "file-loader",
        },
      ],
    },
    {
      test: /\.(png|jpe?g|gif)$/i,
      use: [
        {
          loader: "file-loader",
        },
      ],
    },
  ];

  config.resolve.extensions.push(".ts", ".tsx");
  return config;
};
