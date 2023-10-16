import path from "node:path";
import URL from "node:url";
import fs from "node:fs";

const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    'main': './src/lib/main.ts',
    'workers/frame': './src/lib/workers/frame.ts',
    'workers/photons': './src/lib/workers/photons.ts',
    
    ...fs.readdirSync("./src/scenes")
      .filter(file => file.endsWith(".ts"))
      .reduce((acc, file) => (acc["scenes/" + file.slice(0, -3)] = './src/scenes/' + file, acc), {})
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist', 'js')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map',
  mode: "development",
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/lib/')
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    },
    compress: true,
    port: 9000
  }
};