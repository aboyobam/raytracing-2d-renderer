# Raytracing 2D Renderer
![](https://github.com/aboyobam/raytracing-2d-renderer/blob/master/preview/8-glass.png)

Animated Cube | Suzanne
:-:|:-:
![](https://github.com/aboyobam/raytracing-2d-renderer/blob/master/preview.gif) | ![](https://github.com/aboyobam/raytracing-2d-renderer/blob/master/preview2.gif)

Written in strict typescript.

It uses multithreading with WebWorkers and a SharedArrayBuffer as the storage for the pixels accross all threads.
With planar projection of all faces into a quad tree, it can handle hundreds of vertecies without any performance penalty; but it is still slow. 

## How to run
First install all build dependencies.
```sh
npm install
```

Then start the webpack bundeling
```sh
npm run webpack-w
```

Then start the static file server
```sh
node serve.mjs
```

Then you can start a webpack dev server with `npm start` or compile the code with `npm run build` \
After that, you can open the `dist/index.html` and you should see the cube rendered.

It uses no runtime dependencies and is only 4.7kb (with gzip, no 3D models)

## License
Feel free to steal my code. Most of it way written by ChatGPT anyway.
