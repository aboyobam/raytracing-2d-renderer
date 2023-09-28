import path from "node:path";
import URL from "node:url";

const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/example1.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map',
  mode: "development",
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devServer: {
    static: {
        directory: path.join(__dirname, 'dist'), // Serve content out of the 'dist' folder
    },
    compress: true, // Enable gzip compression
    port: 9000 // Set the port to 9000
  }
};